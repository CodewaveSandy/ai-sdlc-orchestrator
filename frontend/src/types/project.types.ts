export type ProjectStatus =
  | "DRAFT"
  | "DISCOVERY"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED";

export type ProjectStage =
  | "REQUIREMENT"
  | "PRODUCT_DISCOVERY"
  | "ARCHITECTURE"
  | "DEVELOPMENT"
  | "QA"
  | "DEPLOYMENT"
  | "COMPLETED";

export interface Project {
  _id: string;
  name: string;
  description?: string;
  rawRequirement?: string;
  status: ProjectStatus;
  currentStage: ProjectStage;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface ProjectResponse {
  success: boolean;
  data: {
    project: Project;
  };
}

export interface ProjectsResponse {
  success: boolean;
  data: {
    projects: Project[];
  };
}

export interface CreateProjectResponse {
  success: boolean;
  message: string;
  data: {
    project: Project;
  };
}

