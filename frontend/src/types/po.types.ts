export type PoDecision = "NEEDS_CLARIFICATION" | "READY_FOR_SCOPE";

export type AgentRunStatus =
  | "CREATED"
  | "RUNNING"
  | "WAITING_FOR_HUMAN"
  | "COMPLETED"
  | "FAILED";

export interface PoRequirementAnalysis {
  decision: PoDecision;
  requirementSummary: string;
  clarificationQuestions: string[];
  assumptions: string[];
}

export interface PoClarificationRound {
  questions: string[];
  answers: string[];
  answeredAt: string;
}

export interface PoWorkflowState {
  agentRunId: string;
  status: AgentRunStatus;
  analysis?: PoRequirementAnalysis;
  clarificationRounds: PoClarificationRound[];
  error?: string;
}

export interface SubmitRequirementPayload {
  requirement: string;
}

export interface SubmitClarificationsPayload {
  agentRunId: string;
  answers: string[];
}

export interface RequirementAnalysisResponse {
  success: boolean;
  message: string;

  data: {
    agentRunId: string;
    status: AgentRunStatus;
    analysis: PoRequirementAnalysis;
  };
}

export interface PoWorkflowStateResponse {
  success: boolean;

  data: {
    state: PoWorkflowState | null;
  };
}

export interface SubmitClarificationsResponse {
  success: boolean;
  message: string;

  data: {
    state: PoWorkflowState;
  };
}

