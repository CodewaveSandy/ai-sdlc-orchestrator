import { model, Schema, type HydratedDocument, type Model } from "mongoose";

import {
  PROJECT_STAGES,
  PROJECT_STATUSES,
  type Project,
} from "../types/project.types";

export type ProjectDocument = HydratedDocument<Project>;

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
      default: "DRAFT",
      required: true,
    },

    currentStage: {
      type: String,
      enum: PROJECT_STAGES,
      default: "REQUIREMENT",
      required: true,
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const ProjectModel: Model<Project> = model<Project>("Project", projectSchema);

export default ProjectModel;

