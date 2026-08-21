import type { AgentRunStatus } from "./po.types";

export type DevelopmentTaskType =
  | "SCAFFOLD"
  | "BACKEND"
  | "FRONTEND"
  | "DATABASE"
  | "INTEGRATION"
  | "TESTING"
  | "CONFIGURATION";

export type DevelopmentTaskStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "COMPLETED"
  | "FAILED";

export interface DevelopmentPlanTask {
  taskKey: string;
  title: string;
  description: string;
  objective: string;
  taskType: DevelopmentTaskType;
  relatedUserStories: string[];
  acceptanceCriteria: string[];
  dependencies: string[];
  targetAreas: string[];
}

export interface DevelopmentPlan {
  implementationSummary: string;
  executionStrategy: string;
  tasks: DevelopmentPlanTask[];
}

export interface DevelopmentTask {
  _id: string;
  projectId: string;
  agentRunId: string;
  taskKey: string;
  order: number;
  title: string;
  description: string;
  objective: string;
  taskType: DevelopmentTaskType;
  relatedUserStories: string[];
  acceptanceCriteria: string[];
  dependencies: string[];
  targetAreas: string[];
  status: DevelopmentTaskStatus;
  attemptCount: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DevelopmentPlanUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface DevelopmentPlanWorkflowState {
  agentRunId: string;
  status: AgentRunStatus;
  plan?: DevelopmentPlan;
  tasks: DevelopmentTask[];
  usage?: DevelopmentPlanUsage;
  error?: string;
}

export interface DevelopmentPlanStateResponse {
  success: boolean;

  data: {
    state: DevelopmentPlanWorkflowState | null;
  };
}

