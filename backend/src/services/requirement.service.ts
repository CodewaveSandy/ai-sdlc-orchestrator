import {
  analyzeRequirement,
  type PoAgentExecutionResult,
} from "../agents/po/po.agent";
import {
  poAgentRunInputSchema,
  poRequirementAnalysisSchema,
  type PoAgentRunInput,
  type PoClarificationRound,
} from "../agents/po/po.schemas";
import { env } from "../config/env";
import AgentRunModel, {
  type AgentRunDocument,
} from "../models/agent-run.model";
import type {
  PoWorkflowState,
  RequirementAnalysisResult,
} from "../types/requirement.types";
import { AppError } from "../utils/app-error";
import { getProjectById, setProjectRequirement } from "./project.service";

const createPoWorkflowState = (agentRun: AgentRunDocument): PoWorkflowState => {
  const parsedInput = poAgentRunInputSchema.safeParse(agentRun.input);

  const parsedOutput = poRequirementAnalysisSchema.safeParse(agentRun.output);

  return {
    agentRunId: agentRun.id,
    status: agentRun.status,

    analysis: parsedOutput.success ? parsedOutput.data : undefined,

    clarificationRounds: parsedInput.success
      ? parsedInput.data.clarificationRounds
      : [],

    error: agentRun.error,
  };
};

const updateAgentRunFromResult = (
  agentRun: AgentRunDocument,
  result: PoAgentExecutionResult,
): void => {
  const nextStatus =
    result.analysis.decision === "NEEDS_CLARIFICATION"
      ? "WAITING_FOR_HUMAN"
      : "COMPLETED";

  agentRun.status = nextStatus;
  agentRun.output = result.analysis;
  agentRun.providerResponseId = result.providerResponseId;
  agentRun.modelName = result.model;

  const existingUsage = agentRun.usage;

  agentRun.usage = {
    inputTokens: (existingUsage?.inputTokens ?? 0) + result.usage.inputTokens,

    outputTokens:
      (existingUsage?.outputTokens ?? 0) + result.usage.outputTokens,

    totalTokens: (existingUsage?.totalTokens ?? 0) + result.usage.totalTokens,
  };

  if (nextStatus === "COMPLETED") {
    agentRun.completedAt = new Date();
  }
};

export const submitProjectRequirement = async (
  projectId: string,
  rawRequirement: string,
): Promise<RequirementAnalysisResult | null> => {
  const existingProject = await getProjectById(projectId);

  if (!existingProject) {
    return null;
  }

  await setProjectRequirement(projectId, rawRequirement);

  const agentRun = await AgentRunModel.create({
    projectId,
    agentType: "PRODUCT_OWNER",
    status: "CREATED",
    modelName: env.openaiModel,

    input: {
      rawRequirement,
      clarificationRounds: [],
    },
  });

  try {
    agentRun.status = "RUNNING";
    agentRun.startedAt = new Date();

    await agentRun.save();

    const result = await analyzeRequirement(
      existingProject.name,
      rawRequirement,
    );

    updateAgentRunFromResult(agentRun, result);

    await agentRun.save();

    return {
      agentRunId: agentRun.id,
      status: agentRun.status,
      analysis: result.analysis,
    };
  } catch (error) {
    agentRun.status = "FAILED";
    agentRun.completedAt = new Date();

    agentRun.error =
      error instanceof Error
        ? error.message
        : "Unknown PO Agent execution error";

    await agentRun.save();

    throw error;
  }
};

export const getProjectPoWorkflowState = async (
  projectId: string,
): Promise<PoWorkflowState | null> => {
  const project = await getProjectById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const agentRun = await AgentRunModel.findOne({
    projectId,
    agentType: "PRODUCT_OWNER",
  }).sort({
    createdAt: -1,
  });

  if (!agentRun) {
    return null;
  }

  return createPoWorkflowState(agentRun);
};

export const submitPoClarificationAnswers = async (
  projectId: string,
  agentRunId: string,
  answers: string[],
): Promise<PoWorkflowState> => {
  const project = await getProjectById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const agentRun = await AgentRunModel.findOne({
    _id: agentRunId,
    projectId,
    agentType: "PRODUCT_OWNER",
  });

  if (!agentRun) {
    throw new AppError("PO Agent run not found", 404);
  }

  if (agentRun.status !== "WAITING_FOR_HUMAN") {
    throw new AppError("PO Agent is not waiting for clarification", 409);
  }

  const parsedOutput = poRequirementAnalysisSchema.safeParse(agentRun.output);

  if (!parsedOutput.success) {
    throw new AppError("PO Agent clarification state is invalid", 409);
  }

  if (parsedOutput.data.decision !== "NEEDS_CLARIFICATION") {
    throw new AppError(
      "PO Agent does not currently require clarification",
      409,
    );
  }

  const questions = parsedOutput.data.clarificationQuestions;

  if (answers.length !== questions.length) {
    throw new AppError(
      `Expected ${questions.length} clarification answers`,
      400,
    );
  }

  const normalizedAnswers = answers.map((answer) => answer.trim());

  if (normalizedAnswers.some((answer) => !answer)) {
    throw new AppError("All clarification questions must be answered", 400);
  }

  const parsedInput = poAgentRunInputSchema.safeParse(agentRun.input);

  if (!parsedInput.success) {
    throw new AppError("PO Agent input state is invalid", 409);
  }

  const clarificationRound: PoClarificationRound = {
    questions,
    answers: normalizedAnswers,
    answeredAt: new Date().toISOString(),
  };

  const updatedInput: PoAgentRunInput = {
    rawRequirement: parsedInput.data.rawRequirement,

    clarificationRounds: [
      ...parsedInput.data.clarificationRounds,
      clarificationRound,
    ],
  };

  agentRun.input = updatedInput;
  agentRun.status = "RUNNING";
  agentRun.error = undefined;

  await agentRun.save();

  try {
    const result = await analyzeRequirement(
      project.name,
      updatedInput.rawRequirement,
      updatedInput.clarificationRounds,
    );

    updateAgentRunFromResult(agentRun, result);

    await agentRun.save();

    return createPoWorkflowState(agentRun);
  } catch (error) {
    agentRun.status = "FAILED";
    agentRun.completedAt = new Date();

    agentRun.error =
      error instanceof Error
        ? error.message
        : "Unknown PO Agent execution error";

    await agentRun.save();

    throw error;
  }
};

