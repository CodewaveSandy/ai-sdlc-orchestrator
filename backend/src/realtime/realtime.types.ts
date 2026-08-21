export const REALTIME_EVENTS = {
  PROJECT_UPDATED: "project:updated",
  WORKFLOW_UPDATED: "workflow:updated",
  AGENT_RUN_UPDATED: "agent-run:updated",
} as const;

export type RealtimeEventName =
  (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];

export const WORKFLOW_UPDATE_REASONS = [
  "PROJECT_UPDATED",
  "REQUIREMENT_UPDATED",
  "SCOPE_UPDATED",
  "ARCHITECTURE_UPDATED",
  "AGENT_RUN_UPDATED",
  "WORKFLOW_FAILED",
] as const;

export type WorkflowUpdateReason = (typeof WORKFLOW_UPDATE_REASONS)[number];

export interface ProjectRealtimeEvent {
  projectId: string;
  reason: WorkflowUpdateReason;
  occurredAt: string;
}

export interface AgentRunRealtimeEvent extends ProjectRealtimeEvent {
  agentType: "PRODUCT_OWNER" | "ARCHITECT" | "DEVELOPER" | "QA" | "DEVOPS";

  taskType: "REQUIREMENT_ANALYSIS" | "SCOPE_GENERATION" | "ARCHITECTURE_DESIGN";

  status: "CREATED" | "RUNNING" | "WAITING_FOR_HUMAN" | "COMPLETED" | "FAILED";
}

