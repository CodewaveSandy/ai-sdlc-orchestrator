import type {
  PoClarificationRound,
  PoRequirementAnalysis,
} from "../agents/po/po.schemas";
import type { AgentRunStatus } from "./agent-run.types";

export interface SubmitRequirementInput {
  requirement: string;
}

export interface SubmitClarificationAnswersInput {
  agentRunId: string;
  answers: string[];
}

export interface RequirementAnalysisResult {
  agentRunId: string;
  status: AgentRunStatus;
  analysis: PoRequirementAnalysis;
}

export interface PoWorkflowState {
  agentRunId: string;
  status: AgentRunStatus;
  analysis?: PoRequirementAnalysis;
  clarificationRounds: PoClarificationRound[];
  error?: string;
}

