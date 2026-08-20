export const PROJECT_STATUSES = [
  "DRAFT",
  "DISCOVERY",
  "IN_PROGRESS",
  "COMPLETED",
  "FAILED",
] as const;

export const PROJECT_STAGES = [
  "REQUIREMENT",
  "PRODUCT_DISCOVERY",
  "ARCHITECTURE",
  "DEVELOPMENT",
  "QA",
  "DEPLOYMENT",
  "COMPLETED",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export type ProjectStage = (typeof PROJECT_STAGES)[number];

export interface Project {
  name: string;
  description?: string;
  rawRequirement?: string;
  status: ProjectStatus;
  currentStage: ProjectStage;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

