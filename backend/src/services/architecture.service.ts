import {
  generateArchitecture,
  reviseArchitecture,
  type ArchitectExecutionResult,
} from "../agents/architect/architect.agent";
import {
  architectureProposalSchema,
  architectRunInputSchema,
  type ArchitectureRevision,
  type ArchitectRunInput,
} from "../agents/architect/architect.schemas";
import { productScopeSchema } from "../agents/po/po-scope.schemas";
import { env } from "../config/env";
import AgentRunModel, {
  type AgentRunDocument,
} from "../models/agent-run.model";
import type { ArchitectureWorkflowState } from "../types/architecture.types";
import { AppError } from "../utils/app-error";
import { getProjectById } from "./project.service";

const createArchitectureWorkflowState = (
  agentRun: AgentRunDocument,
): ArchitectureWorkflowState => {
  const parsedInput = architectRunInputSchema.safeParse(agentRun.input);

  const parsedArchitecture = architectureProposalSchema.safeParse(
    agentRun.output,
  );

  return {
    agentRunId: agentRun.id,
    status: agentRun.status,

    architecture: parsedArchitecture.success
      ? parsedArchitecture.data
      : undefined,

    input: parsedInput.success ? parsedInput.data : undefined,

    usage: agentRun.usage,
    error: agentRun.error,
  };
};

const applyArchitectResult = (
  agentRun: AgentRunDocument,
  result: ArchitectExecutionResult,
): void => {
  agentRun.status = "WAITING_FOR_HUMAN";

  agentRun.output = result.architecture;

  agentRun.providerResponseId = result.providerResponseId;

  agentRun.modelName = result.model;

  const currentUsage = agentRun.usage;

  agentRun.usage = {
    inputTokens: (currentUsage?.inputTokens ?? 0) + result.usage.inputTokens,

    outputTokens: (currentUsage?.outputTokens ?? 0) + result.usage.outputTokens,

    totalTokens: (currentUsage?.totalTokens ?? 0) + result.usage.totalTokens,
  };
};

const getApprovedScopeRun = async (
  projectId: string,
): Promise<AgentRunDocument> => {
  const scopeRun = await AgentRunModel.findOne({
    projectId,
    agentType: "PRODUCT_OWNER",
    taskType: "SCOPE_GENERATION",
    status: "COMPLETED",
  }).sort({
    createdAt: -1,
  });

  if (!scopeRun) {
    throw new AppError(
      "Product scope must be approved before architecture can begin",
      409,
    );
  }

  return scopeRun;
};

export const getProjectArchitectureState = async (
  projectId: string,
): Promise<ArchitectureWorkflowState | null> => {
  const project = await getProjectById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const architectureRun = await AgentRunModel.findOne({
    projectId,
    agentType: "ARCHITECT",
    taskType: "ARCHITECTURE_DESIGN",
  }).sort({
    createdAt: -1,
  });

  if (!architectureRun) {
    return null;
  }

  return createArchitectureWorkflowState(architectureRun);
};

export const generateProjectArchitecture = async (
  projectId: string,
): Promise<ArchitectureWorkflowState> => {
  const project = await getProjectById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const existingRun = await AgentRunModel.findOne({
    projectId,
    agentType: "ARCHITECT",
    taskType: "ARCHITECTURE_DESIGN",
  }).sort({
    createdAt: -1,
  });

  if (existingRun) {
    throw new AppError(
      "An architecture proposal already exists for this project",
      409,
    );
  }

  const scopeRun = await getApprovedScopeRun(projectId);

  const parsedScope = productScopeSchema.safeParse(scopeRun.output);

  if (!parsedScope.success) {
    throw new AppError("Approved product scope is invalid", 409);
  }

  const architectInput: ArchitectRunInput = {
    approvedScope: parsedScope.data,

    revisions: [],
  };

  const architectureRun = await AgentRunModel.create({
    projectId,
    agentType: "ARCHITECT",
    taskType: "ARCHITECTURE_DESIGN",
    status: "CREATED",
    modelName: env.openaiModel,
    input: architectInput,
  });

  try {
    architectureRun.status = "RUNNING";

    architectureRun.startedAt = new Date();

    await architectureRun.save();

    const result = await generateArchitecture(project.name, architectInput);

    applyArchitectResult(architectureRun, result);

    await architectureRun.save();

    return createArchitectureWorkflowState(architectureRun);
  } catch (error) {
    architectureRun.status = "FAILED";

    architectureRun.completedAt = new Date();

    architectureRun.error =
      error instanceof Error
        ? error.message
        : "Unknown architecture generation error";

    await architectureRun.save();

    throw error;
  }
};

export const reviseProjectArchitecture = async (
  projectId: string,
  agentRunId: string,
  feedback: string,
): Promise<ArchitectureWorkflowState> => {
  const project = await getProjectById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const architectureRun = await AgentRunModel.findOne({
    _id: agentRunId,
    projectId,
    agentType: "ARCHITECT",
    taskType: "ARCHITECTURE_DESIGN",
  });

  if (!architectureRun) {
    throw new AppError("Architecture run not found", 404);
  }

  if (architectureRun.status !== "WAITING_FOR_HUMAN") {
    throw new AppError("Architecture is not waiting for human review", 409);
  }

  const parsedInput = architectRunInputSchema.safeParse(architectureRun.input);

  const parsedArchitecture = architectureProposalSchema.safeParse(
    architectureRun.output,
  );

  if (!parsedInput.success || !parsedArchitecture.success) {
    throw new AppError("Architecture state is invalid", 409);
  }

  const normalizedFeedback = feedback.trim();

  if (!normalizedFeedback) {
    throw new AppError("Architecture revision feedback is required", 400);
  }

  const revision: ArchitectureRevision = {
    feedback: normalizedFeedback,

    previousArchitecture: parsedArchitecture.data,

    requestedAt: new Date().toISOString(),
  };

  const updatedInput: ArchitectRunInput = {
    ...parsedInput.data,

    revisions: [...parsedInput.data.revisions, revision],
  };

  architectureRun.input = updatedInput;

  architectureRun.status = "RUNNING";

  architectureRun.error = undefined;

  await architectureRun.save();

  try {
    const result = await reviseArchitecture(
      project.name,
      updatedInput,
      parsedArchitecture.data,
      normalizedFeedback,
    );

    applyArchitectResult(architectureRun, result);

    await architectureRun.save();

    return createArchitectureWorkflowState(architectureRun);
  } catch (error) {
    architectureRun.status = "FAILED";

    architectureRun.completedAt = new Date();

    architectureRun.error =
      error instanceof Error
        ? error.message
        : "Unknown architecture revision error";

    await architectureRun.save();

    throw error;
  }
};

export const approveArchitectureRun = async (
  projectId: string,
  agentRunId: string,
): Promise<ArchitectureWorkflowState> => {
  const project = await getProjectById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const architectureRun = await AgentRunModel.findOne({
    _id: agentRunId,
    projectId,
    agentType: "ARCHITECT",
    taskType: "ARCHITECTURE_DESIGN",
  });

  if (!architectureRun) {
    throw new AppError("Architecture run not found", 404);
  }

  if (architectureRun.status !== "WAITING_FOR_HUMAN") {
    throw new AppError("Architecture is not waiting for approval", 409);
  }

  const parsedArchitecture = architectureProposalSchema.safeParse(
    architectureRun.output,
  );

  if (!parsedArchitecture.success) {
    throw new AppError("Architecture proposal is invalid", 409);
  }

  architectureRun.status = "COMPLETED";

  architectureRun.completedAt = new Date();

  await architectureRun.save();

  return createArchitectureWorkflowState(architectureRun);
};

