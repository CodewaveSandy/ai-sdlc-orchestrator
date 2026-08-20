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

export const PROJECT_WORKFLOW_STATUSES = [
  "IDLE",
  "RUNNING",
  "WAITING_FOR_HUMAN",
  "FAILED",
  "COMPLETED",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export type ProjectStage = (typeof PROJECT_STAGES)[number];

export type ProjectWorkflowStatus = (typeof PROJECT_WORKFLOW_STATUSES)[number];

export interface Project {
  _id: string;
  name: string;
  description?: string;
  rawRequirement?: string;
  status: ProjectStatus;
  currentStage: ProjectStage;

  /*
   * Temporarily optional for projects created
   * before workflowStatus was introduced.
   */
  workflowStatus?: ProjectWorkflowStatus;

  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface ProjectsResponse {
  success: boolean;

  data: {
    projects: Project[];
  };
}

export interface ProjectResponse {
  success: boolean;

  data: {
    project: Project;
  };
}

export interface CreateProjectResponse {
  success: boolean;
  message: string;

  data: {
    project: Project;
  };
}

