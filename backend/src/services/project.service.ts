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
    isDeleted: false,
  });

  return project.toObject();
};

export const getProjectById = async (
  projectId: string,
): Promise<Project | null> => {
  if (!mongoose.isValidObjectId(projectId)) {
    return null;
  }

  return ProjectModel.findOne({
    _id: projectId,
    isDeleted: false,
  }).lean();
};

export const getProjects = async (): Promise<Project[]> => {
  return ProjectModel.find({
    isDeleted: false,
  })
    .sort({
      createdAt: -1,
    })
    .lean();
};

export const softDeleteProject = async (
  projectId: string,
): Promise<Project | null> => {
  if (!mongoose.isValidObjectId(projectId)) {
    return null;
  }

  return ProjectModel.findOneAndUpdate(
    {
      _id: projectId,
      isDeleted: false,
    },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
        workflowStatus: "IDLE",
      },
    },
    {
      returnDocument: "after",
    },
  ).lean();
};

export const setProjectRequirement = async (
  projectId: string,
  rawRequirement: string,
): Promise<Project | null> => {
  if (!mongoose.isValidObjectId(projectId)) {
    return null;
  }

  return ProjectModel.findOneAndUpdate(
    {
      _id: projectId,
      isDeleted: false,
    },
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

  return ProjectModel.findOneAndUpdate(
    {
      _id: projectId,
      isDeleted: false,
    },
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

  return ProjectModel.findOneAndUpdate(
    {
      _id: projectId,
      isDeleted: false,
    },
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

