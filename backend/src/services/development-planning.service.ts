import {
  generateDevelopmentPlan,
  type DevelopmentPlanningExecutionResult,
} from "../agents/developer/developer-planning.agent";
import {
  developmentPlanSchema,
  developmentPlanningInputSchema,
  type DevelopmentPlan,
  type DevelopmentPlanningInput,
} from "../agents/developer/developer-planning.schemas";
import { architectureProposalSchema } from "../agents/architect/architect.schemas";
import { productScopeSchema } from "../agents/po/po-scope.schemas";
import { env } from "../config/env";
import AgentRunModel, {
  type AgentRunDocument,
} from "../models/agent-run.model";
import DevelopmentTaskModel from "../models/development-task.model";
import type {
  DevelopmentPlanWorkflowState,
  DevelopmentTask,
} from "../types/development-task.types";
import { AppError } from "../utils/app-error";
import { getProjectById } from "./project.service";

const createDevelopmentPlanState = async (
  run: AgentRunDocument,
): Promise<DevelopmentPlanWorkflowState> => {
  const parsedPlan = developmentPlanSchema.safeParse(run.output);

  const tasks = await DevelopmentTaskModel.find({
    projectId: run.projectId.toString(),

    agentRunId: run.id,
  })
    .sort({
      order: 1,
    })
    .lean();

  return {
    agentRunId: run.id,

    status: run.status,

    plan: parsedPlan.success ? parsedPlan.data : undefined,

    tasks: tasks as DevelopmentTask[],

    usage: run.usage,

    error: run.error,
  };
};

const getApprovedScope = async (projectId: string): Promise<unknown> => {
  const run = await AgentRunModel.findOne({
    projectId,
    agentType: "PRODUCT_OWNER",
    taskType: "SCOPE_GENERATION",
    status: "COMPLETED",
  }).sort({
    createdAt: -1,
  });

  if (!run) {
    throw new AppError("Approved product scope not found", 409);
  }

  const parsed = productScopeSchema.safeParse(run.output);

  if (!parsed.success) {
    throw new AppError("Approved product scope is invalid", 409);
  }

  return parsed.data;
};

const getApprovedArchitecture = async (projectId: string): Promise<unknown> => {
  const run = await AgentRunModel.findOne({
    projectId,
    agentType: "ARCHITECT",
    taskType: "ARCHITECTURE_DESIGN",
    status: "COMPLETED",
  }).sort({
    createdAt: -1,
  });

  if (!run) {
    throw new AppError("Approved architecture not found", 409);
  }

  const parsed = architectureProposalSchema.safeParse(run.output);

  if (!parsed.success) {
    throw new AppError("Approved architecture is invalid", 409);
  }

  return parsed.data;
};

const validateTaskGraph = (plan: DevelopmentPlan): void => {
  const seenKeys = new Set<string>();

  plan.tasks.forEach((task, index) => {
    const expectedTaskKey = `DEV-${index + 1}`;

    if (task.taskKey !== expectedTaskKey) {
      throw new AppError(
        `Development plan task identifiers must be sequential. Expected ${expectedTaskKey} but received ${task.taskKey}.`,
        500,
      );
    }

    for (const dependency of task.dependencies) {
      if (!seenKeys.has(dependency)) {
        throw new AppError(
          `Development task ${task.taskKey} has invalid dependency ${dependency}`,
          500,
        );
      }
    }

    seenKeys.add(task.taskKey);
  });
};

const persistDevelopmentTasks = async (
  projectId: string,
  agentRunId: string,
  plan: DevelopmentPlan,
): Promise<void> => {
  validateTaskGraph(plan);

  await DevelopmentTaskModel.deleteMany({
    projectId,
    agentRunId,
  });

  const tasks = plan.tasks.map((task, index) => ({
    projectId,
    agentRunId,

    taskKey: task.taskKey,

    order: index + 1,

    title: task.title,

    description: task.description,

    objective: task.objective,

    taskType: task.taskType,

    relatedUserStories: task.relatedUserStories,

    acceptanceCriteria: task.acceptanceCriteria,

    dependencies: task.dependencies,

    targetAreas: task.targetAreas,

    status: "PLANNED" as const,

    attemptCount: 0,
  }));

  await DevelopmentTaskModel.insertMany(tasks);
};

const applyPlanningResult = (
  run: AgentRunDocument,
  result: DevelopmentPlanningExecutionResult,
): void => {
  run.output = result.plan;

  run.providerResponseId = result.providerResponseId;

  run.modelName = result.model;

  run.usage = {
    inputTokens: result.usage.inputTokens,

    outputTokens: result.usage.outputTokens,

    totalTokens: result.usage.totalTokens,
  };

  run.status = "COMPLETED";

  run.completedAt = new Date();
};

export const getDevelopmentPlanState = async (
  projectId: string,
): Promise<DevelopmentPlanWorkflowState | null> => {
  const project = await getProjectById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const run = await AgentRunModel.findOne({
    projectId,
    agentType: "DEVELOPER",
    taskType: "DEVELOPMENT_PLANNING",
  }).sort({
    createdAt: -1,
  });

  if (!run) {
    return null;
  }

  return createDevelopmentPlanState(run);
};

export const generateProjectDevelopmentPlan = async (
  projectId: string,
): Promise<DevelopmentPlanWorkflowState> => {
  const project = await getProjectById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const existingRun = await AgentRunModel.findOne({
    projectId,
    agentType: "DEVELOPER",
    taskType: "DEVELOPMENT_PLANNING",
  }).sort({
    createdAt: -1,
  });

  if (existingRun) {
    return createDevelopmentPlanState(existingRun);
  }

  const [approvedScope, approvedArchitecture] = await Promise.all([
    getApprovedScope(projectId),

    getApprovedArchitecture(projectId),
  ]);

  const parsedInput = developmentPlanningInputSchema.parse({
    approvedScope,
    approvedArchitecture,
  });

  const input: DevelopmentPlanningInput = parsedInput;

  const run = await AgentRunModel.create({
    projectId,
    agentType: "DEVELOPER",
    taskType: "DEVELOPMENT_PLANNING",
    status: "CREATED",
    modelName: env.openaiModel,
    input,
  });

  try {
    run.status = "RUNNING";

    run.startedAt = new Date();

    await run.save();

    const result = await generateDevelopmentPlan(project.name, input);

    await persistDevelopmentTasks(projectId, run.id, result.plan);

    applyPlanningResult(run, result);

    await run.save();

    return createDevelopmentPlanState(run);
  } catch (error) {
    run.status = "FAILED";

    run.completedAt = new Date();

    run.error =
      error instanceof Error
        ? error.message
        : "Unknown development planning error";

    await run.save();

    throw error;
  }
};

