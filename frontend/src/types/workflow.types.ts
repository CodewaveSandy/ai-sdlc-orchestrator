export const WORKSPACE_STEP_IDS = [
  "REQUIREMENT_DISCOVERY",
  "PRODUCT_SCOPE",
  "ARCHITECTURE",
  "DEVELOPMENT",
  "QA",
  "DEPLOYMENT",
] as const;

export const WORKSPACE_STEP_STATUSES = [
  "COMPLETED",
  "RUNNING",
  "WAITING_FOR_HUMAN",
  "FAILED",
  "CURRENT",
  "PENDING",
] as const;

export type WorkspaceStepId = (typeof WORKSPACE_STEP_IDS)[number];

export type WorkspaceStepStatus = (typeof WORKSPACE_STEP_STATUSES)[number];

export interface WorkspaceStep {
  id: WorkspaceStepId;
  number: string;
  title: string;
  subtitle: string;
  status: WorkspaceStepStatus;
}

