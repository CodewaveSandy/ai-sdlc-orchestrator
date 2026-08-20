import mongoose from "mongoose";

import ProjectModel from "../models/project.model";
import type {
  CreateProjectInput,
  Project,
  ProjectWorkflowStatus,
} from "../types/project.types";

export const createProject = async (
  input: CreateProjectInput,
): Promise<Project> => {
  const project = await ProjectModel.create({
    name: input.name,
    description: input.description,
    status: "DRAFT",
    currentStage: "REQUIREMENT",
    workflowStatus: "IDLE",
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

export const setProjectRequirement = async (
  projectId: string,
  rawRequirement: string,
): Promise<Project | null> => {
  if (!mongoose.isValidObjectId(projectId)) {
    return null;
  }

  return ProjectModel.findByIdAndUpdate(
    projectId,
    {
      $set: {
        rawRequirement,
        status: "DISCOVERY",
        currentStage: "PRODUCT_DISCOVERY",
        workflowStatus: "RUNNING",
      },
    },
    {
      returnDocument: "after",
    },
  ).lean();
};

export const setProjectWorkflowStatus = async (
  projectId: string,
  workflowStatus: ProjectWorkflowStatus,
): Promise<Project | null> => {
  if (!mongoose.isValidObjectId(projectId)) {
    return null;
  }

  return ProjectModel.findByIdAndUpdate(
    projectId,
    {
      $set: {
        workflowStatus,
      },
    },
    {
      returnDocument: "after",
    },
  ).lean();
};

export const completeProductDiscovery = async (
  projectId: string,
): Promise<Project | null> => {
  if (!mongoose.isValidObjectId(projectId)) {
    return null;
  }

  return ProjectModel.findByIdAndUpdate(
    projectId,
    {
      $set: {
        status: "IN_PROGRESS",
        currentStage: "ARCHITECTURE",
        workflowStatus: "IDLE",
        progress: 15,
      },
    },
    {
      returnDocument: "after",
    },
  ).lean();
};

