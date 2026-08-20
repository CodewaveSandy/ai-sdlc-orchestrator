import type { AgentRunStatus } from "./po.types";

export type ProductPriority = "MUST_HAVE" | "SHOULD_HAVE" | "COULD_HAVE";

export interface ProductFeature {
  featureKey: string;
  name: string;
  description: string;
  priority: ProductPriority;
}

export interface ProductUserStory {
  storyKey: string;
  featureKey: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  priority: ProductPriority;
  dependencies: string[];
}

export interface ProductScope {
  productSummary: string;
  productGoals: string[];
  features: ProductFeature[];
  userStories: ProductUserStory[];
  assumptions: string[];
  outOfScope: string[];
}

export interface ScopeRevision {
  feedback: string;
  previousScope: ProductScope;
  requestedAt: string;
}

export interface PoScopeRunInput {
  rawRequirement: string;

  requirementAnalysis: {
    requirementSummary: string;
    assumptions: string[];
  };

  clarificationRounds: {
    questions: string[];
    answers: string[];
    answeredAt: string;
  }[];

  revisions: ScopeRevision[];
}

export interface AgentRunUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface ScopeWorkflowState {
  agentRunId: string;
  status: AgentRunStatus;
  scope?: ProductScope;
  input?: PoScopeRunInput;
  usage?: AgentRunUsage;
  error?: string;
}

export interface ScopeStateResponse {
  success: boolean;

  data: {
    state: ScopeWorkflowState | null;
  };
}

export interface ScopeMutationResponse {
  success: boolean;
  message: string;

  data: {
    state: ScopeWorkflowState;
  };
}

