import type { PoRequirementAnalysis } from "../agents/po/po.schemas";

export interface SubmitRequirementInput {
  requirement: string;
}

export interface RequirementAnalysisResult {
  agentRunId: string;
  status: "WAITING_FOR_HUMAN" | "COMPLETED";

  analysis: PoRequirementAnalysis;
}

