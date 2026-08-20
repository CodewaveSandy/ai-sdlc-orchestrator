export const AGENT_TYPES = [
  "PRODUCT_OWNER",
  "ARCHITECT",
  "DEVELOPER",
  "QA",
  "DEVOPS",
] as const;

export const AGENT_TASK_TYPES = [
  "REQUIREMENT_ANALYSIS",
  "SCOPE_GENERATION",
] as const;

export const AGENT_RUN_STATUSES = [
  "CREATED",
  "RUNNING",
  "WAITING_FOR_HUMAN",
  "COMPLETED",
  "FAILED",
] as const;

export type AgentType = (typeof AGENT_TYPES)[number];

export type AgentTaskType = (typeof AGENT_TASK_TYPES)[number];

export type AgentRunStatus = (typeof AGENT_RUN_STATUSES)[number];

export interface AgentRunUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface AgentRun {
  projectId: string;
  agentType: AgentType;
  taskType?: AgentTaskType;
  status: AgentRunStatus;
  modelName: string;
  input: unknown;
  output?: unknown;
  providerResponseId?: string;
  usage?: AgentRunUsage;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

