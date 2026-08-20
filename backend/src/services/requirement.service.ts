import {
  analyzeRequirement,
  type PoAgentExecutionResult,
} from "../agents/po/po.agent";
import { env } from "../config/env";
import AgentRunModel from "../models/agent-run.model";
import type { RequirementAnalysisResult } from "../types/requirement.types";
import { getProjectById, setProjectRequirement } from "./project.service";

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
    },
  });

  try {
    agentRun.status = "RUNNING";
    agentRun.startedAt = new Date();

    await agentRun.save();

    const result: PoAgentExecutionResult = await analyzeRequirement(
      existingProject.name,
      rawRequirement,
    );

    const status =
      result.analysis.decision === "NEEDS_CLARIFICATION"
        ? "WAITING_FOR_HUMAN"
        : "COMPLETED";

    agentRun.status = status;

    agentRun.output = result.analysis;

    agentRun.providerResponseId = result.providerResponseId;

    agentRun.modelName = result.model;

    agentRun.usage = result.usage;

    if (status === "COMPLETED") {
      agentRun.completedAt = new Date();
    }

    await agentRun.save();

    return {
      agentRunId: agentRun.id,
      status,
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

