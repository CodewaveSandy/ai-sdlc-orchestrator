import type { Request, Response } from "express";

import {
  createProject,
  getProjectById,
  getProjects,
} from "../services/project.service";
import type { CreateProjectInput } from "../types/project.types";

interface ProjectParams {
  projectId: string;
}

export const createProjectController = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const { name, description } = request.body as Partial<CreateProjectInput>;

    if (!name || !name.trim()) {
      response.status(400).json({
        success: false,
        message: "Project name is required",
      });

      return;
    }

    const project = await createProject({
      name: name.trim(),
      description: description?.trim() || undefined,
    });

    response.status(201).json({
      success: true,
      message: "Project created successfully",
      data: {
        project,
      },
    });
  } catch (error) {
    console.error("Failed to create project", error);

    response.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
};

export const getProjectByIdController = async (
  request: Request<ProjectParams>,
  response: Response,
): Promise<void> => {
  try {
    const { projectId } = request.params;

    const project = await getProjectById(projectId);

    if (!project) {
      response.status(404).json({
        success: false,
        message: "Project not found",
      });

      return;
    }

    response.status(200).json({
      success: true,
      data: {
        project,
      },
    });
  } catch (error) {
    console.error("Failed to retrieve project", error);

    response.status(500).json({
      success: false,
      message: "Failed to retrieve project",
    });
  }
};

export const getProjectsController = async (
  _request: Request,
  response: Response,
): Promise<void> => {
  try {
    const projects = await getProjects();

    response.status(200).json({
      success: true,
      data: {
        projects,
      },
    });
  } catch (error) {
    console.error("Failed to retrieve projects", error);

    response.status(500).json({
      success: false,
      message: "Failed to retrieve projects",
    });
  }
};

