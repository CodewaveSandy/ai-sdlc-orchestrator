import { model, Schema, type Model } from "mongoose";

import {
  PROJECT_STAGES,
  PROJECT_STATUSES,
  PROJECT_WORKFLOW_STATUSES,
  type Project,
} from "../types/project.types";

const projectSchema = new Schema<Project>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    rawRequirement: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: PROJECT_STATUSES,
      required: true,
      default: "DRAFT",
      index: true,
    },

    currentStage: {
      type: String,
      enum: PROJECT_STAGES,
      required: true,
      default: "REQUIREMENT",
      index: true,
    },

    workflowStatus: {
      type: String,
      enum: PROJECT_WORKFLOW_STATUSES,
      required: true,
      default: "IDLE",
      index: true,
    },

    progress: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const ProjectModel: Model<Project> = model<Project>("Project", projectSchema);

export default ProjectModel;

