import mongoose from "mongoose";

import ProjectModel from "../models/project.model";
import type { CreateProjectInput, Project } from "../types/project.types";

export const createProject = async (
  input: CreateProjectInput,
): Promise<Project> => {
  const project = await ProjectModel.create({
    name: input.name,
    description: input.description,
    status: "DRAFT",
    currentStage: "REQUIREMENT",
    progress: 0,
  });

  return project.toObject();
};

export const getProjectById = async (
  projectId: string,
): Promise<Project | null> => {
  if (!mongoose.isValidObjectId(projectId)) {
    return null;
  }

  const project = await ProjectModel.findById(projectId).lean();

  return project;
};

export const getProjects = async (): Promise<Project[]> => {
  const projects = await ProjectModel.find()
    .sort({
      createdAt: -1,
    })
    .lean();

  return projects;
};

