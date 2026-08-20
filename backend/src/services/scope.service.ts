import {
  generateProductScope,
  reviseProductScope,
  type PoScopeExecutionResult,
} from "../agents/po/po-scope.agent";
import {
  poScopeRunInputSchema,
  productScopeSchema,
  type PoScopeRunInput,
  type ScopeRevision,
} from "../agents/po/po-scope.schemas";
import {
  poAgentRunInputSchema,
  poRequirementAnalysisSchema,
} from "../agents/po/po.schemas";
import { env } from "../config/env";
import AgentRunModel, {
  type AgentRunDocument,
} from "../models/agent-run.model";
import type { ScopeWorkflowState } from "../types/scope.types";
import { AppError } from "../utils/app-error";
import { getProjectById } from "./project.service";

const createScopeWorkflowState = (
  agentRun: AgentRunDocument,
): ScopeWorkflowState => {
  const parsedInput = poScopeRunInputSchema.safeParse(agentRun.input);

  const parsedScope = productScopeSchema.safeParse(agentRun.output);

  return {
    agentRunId: agentRun.id,
    status: agentRun.status,

    scope: parsedScope.success ? parsedScope.data : undefined,

    input: parsedInput.success ? parsedInput.data : undefined,

    usage: agentRun.usage,
    error: agentRun.error,
  };
};

const applyExecutionResult = (
  agentRun: AgentRunDocument,
  result: PoScopeExecutionResult,
): void => {
  agentRun.status = "WAITING_FOR_HUMAN";

  agentRun.output = result.scope;

  agentRun.providerResponseId = result.providerResponseId;

  agentRun.modelName = result.model;

  const currentUsage = agentRun.usage;

  agentRun.usage = {
    inputTokens: (currentUsage?.inputTokens ?? 0) + result.usage.inputTokens,

    outputTokens: (currentUsage?.outputTokens ?? 0) + result.usage.outputTokens,

    totalTokens: (currentUsage?.totalTokens ?? 0) + result.usage.totalTokens,
  };
};

const getCompletedRequirementRun = async (
  projectId: string,
): Promise<AgentRunDocument> => {
  const requirementRun = await AgentRunModel.findOne({
    projectId,
    agentType: "PRODUCT_OWNER",
    status: "COMPLETED",

    $or: [
      {
        taskType: "REQUIREMENT_ANALYSIS",
      },
      {
        taskType: {
          $exists: false,
        },
      },
    ],
  }).sort({
    createdAt: -1,
  });

  if (!requirementRun) {
    throw new AppError(
      "Requirement discovery must be completed before generating scope",
      409,
    );
  }

  return requirementRun;
};

export const getProjectScopeState = async (
  projectId: string,
): Promise<ScopeWorkflowState | null> => {
  const project = await getProjectById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const scopeRun = await AgentRunModel.findOne({
    projectId,
    agentType: "PRODUCT_OWNER",
    taskType: "SCOPE_GENERATION",
  }).sort({
    createdAt: -1,
  });

  if (!scopeRun) {
    return null;
  }

  return createScopeWorkflowState(scopeRun);
};

export const generateProjectScope = async (
  projectId: string,
): Promise<ScopeWorkflowState> => {
  const project = await getProjectById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const existingScopeRun = await AgentRunModel.findOne({
    projectId,
    agentType: "PRODUCT_OWNER",
    taskType: "SCOPE_GENERATION",
  }).sort({
    createdAt: -1,
  });

  if (existingScopeRun) {
    throw new AppError("A product scope already exists for this project", 409);
  }

  const requirementRun = await getCompletedRequirementRun(projectId);

  const parsedRequirementInput = poAgentRunInputSchema.safeParse(
    requirementRun.input,
  );

  const parsedRequirementOutput = poRequirementAnalysisSchema.safeParse(
    requirementRun.output,
  );

  if (!parsedRequirementInput.success || !parsedRequirementOutput.success) {
    throw new AppError("Completed requirement discovery data is invalid", 409);
  }

  if (parsedRequirementOutput.data.decision !== "READY_FOR_SCOPE") {
    throw new AppError(
      "Requirement discovery is not ready for scope generation",
      409,
    );
  }

  const scopeInput: PoScopeRunInput = {
    rawRequirement: parsedRequirementInput.data.rawRequirement,

    requirementAnalysis: {
      requirementSummary: parsedRequirementOutput.data.requirementSummary,

      assumptions: parsedRequirementOutput.data.assumptions,
    },

    clarificationRounds: parsedRequirementInput.data.clarificationRounds,

    revisions: [],
  };

  const scopeRun = await AgentRunModel.create({
    projectId,
    agentType: "PRODUCT_OWNER",
    taskType: "SCOPE_GENERATION",
    status: "CREATED",
    modelName: env.openaiModel,
    input: scopeInput,
  });

  try {
    scopeRun.status = "RUNNING";
    scopeRun.startedAt = new Date();

    await scopeRun.save();

    const result = await generateProductScope(project.name, scopeInput);

    applyExecutionResult(scopeRun, result);

    await scopeRun.save();

    return createScopeWorkflowState(scopeRun);
  } catch (error) {
    scopeRun.status = "FAILED";
    scopeRun.completedAt = new Date();

    scopeRun.error =
      error instanceof Error ? error.message : "Unknown scope generation error";

    await scopeRun.save();

    throw error;
  }
};

export const reviseProjectScope = async (
  projectId: string,
  agentRunId: string,
  feedback: string,
): Promise<ScopeWorkflowState> => {
  const project = await getProjectById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const scopeRun = await AgentRunModel.findOne({
    _id: agentRunId,
    projectId,
    agentType: "PRODUCT_OWNER",
    taskType: "SCOPE_GENERATION",
  });

  if (!scopeRun) {
    throw new AppError("Product scope run not found", 404);
  }

  if (scopeRun.status !== "WAITING_FOR_HUMAN") {
    throw new AppError("Product scope is not waiting for human review", 409);
  }

  const parsedInput = poScopeRunInputSchema.safeParse(scopeRun.input);

  const parsedScope = productScopeSchema.safeParse(scopeRun.output);

  if (!parsedInput.success || !parsedScope.success) {
    throw new AppError("Product scope state is invalid", 409);
  }

  const normalizedFeedback = feedback.trim();

  if (!normalizedFeedback) {
    throw new AppError("Revision feedback is required", 400);
  }

  const revision: ScopeRevision = {
    feedback: normalizedFeedback,

    previousScope: parsedScope.data,

    requestedAt: new Date().toISOString(),
  };

  const updatedInput: PoScopeRunInput = {
    ...parsedInput.data,

    revisions: [...parsedInput.data.revisions, revision],
  };

  scopeRun.input = updatedInput;
  scopeRun.status = "RUNNING";
  scopeRun.error = undefined;

  await scopeRun.save();

  try {
    const result = await reviseProductScope(
      project.name,
      updatedInput,
      parsedScope.data,
      normalizedFeedback,
    );

    applyExecutionResult(scopeRun, result);

    await scopeRun.save();

    return createScopeWorkflowState(scopeRun);
  } catch (error) {
    scopeRun.status = "FAILED";
    scopeRun.completedAt = new Date();

    scopeRun.error =
      error instanceof Error ? error.message : "Unknown scope revision error";

    await scopeRun.save();

    throw error;
  }
};

export const approveProjectScopeRun = async (
  projectId: string,
  agentRunId: string,
): Promise<ScopeWorkflowState> => {
  const project = await getProjectById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const scopeRun = await AgentRunModel.findOne({
    _id: agentRunId,
    projectId,
    agentType: "PRODUCT_OWNER",
    taskType: "SCOPE_GENERATION",
  });

  if (!scopeRun) {
    throw new AppError("Product scope run not found", 404);
  }

  if (scopeRun.status !== "WAITING_FOR_HUMAN") {
    throw new AppError("Product scope is not waiting for approval", 409);
  }

  const parsedScope = productScopeSchema.safeParse(scopeRun.output);

  if (!parsedScope.success) {
    throw new AppError("Product scope is invalid", 409);
  }

  scopeRun.status = "COMPLETED";
  scopeRun.completedAt = new Date();

  await scopeRun.save();

  return createScopeWorkflowState(scopeRun);
};

