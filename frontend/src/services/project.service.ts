import { apiRequest } from "@/lib/api";
import type {
  CreateProjectPayload,
  CreateProjectResponse,
  DeleteProjectResponse,
  Project,
  ProjectResponse,
  ProjectsResponse,
} from "@/types/project.types";

export const getProjects = async (): Promise<Project[]> => {
  const response = await apiRequest<ProjectsResponse>({
    method: "GET",
    url: "/api/projects",
  });

  return response.data.projects;
};

export const getProjectById = async (projectId: string): Promise<Project> => {
  const response = await apiRequest<ProjectResponse>({
    method: "GET",
    url: `/api/projects/${projectId}`,
  });

  return response.data.project;
};

export const createProject = async (
  payload: CreateProjectPayload,
): Promise<Project> => {
  const response = await apiRequest<CreateProjectResponse>({
    method: "POST",
    url: "/api/projects",
    data: payload,
  });

  return response.data.project;
};

export const deleteProject = async (projectId: string): Promise<void> => {
  await apiRequest<DeleteProjectResponse>({
    method: "DELETE",
    url: `/api/projects/${projectId}`,
  });
};

