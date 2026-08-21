import type {
  DevelopmentPlan,
  DevelopmentTaskType,
} from "../agents/developer/developer-planning.schemas";
import type { AgentRunStatus, AgentRunUsage } from "./agent-run.types";

export const DEVELOPMENT_TASK_STATUSES = [
  "PLANNED",
  "IN_PROGRESS",
  "BLOCKED",
  "COMPLETED",
  "FAILED",
] as const;

export type DevelopmentTaskStatus = (typeof DEVELOPMENT_TASK_STATUSES)[number];

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

  startedAt?: Date;

  completedAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}

export interface DevelopmentPlanWorkflowState {
  agentRunId: string;

  status: AgentRunStatus;

  plan?: DevelopmentPlan;

  tasks: DevelopmentTask[];

  usage?: AgentRunUsage;

  error?: string;
}

