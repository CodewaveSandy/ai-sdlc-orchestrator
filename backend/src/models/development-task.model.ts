import { model, Schema, type HydratedDocument, type Model } from "mongoose";

import { DEVELOPMENT_TASK_TYPES } from "../agents/developer/developer-planning.schemas";
import {
  DEVELOPMENT_TASK_STATUSES,
  type DevelopmentTask,
} from "../types/development-task.types";

export type DevelopmentTaskDocument = HydratedDocument<DevelopmentTask>;

const developmentTaskSchema = new Schema<DevelopmentTask>(
  {
    projectId: {
      type: String,
      required: true,
      index: true,
    },

    agentRunId: {
      type: String,
      required: true,
      index: true,
    },

    taskKey: {
      type: String,
      required: true,
      trim: true,
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    objective: {
      type: String,
      required: true,
      trim: true,
    },

    taskType: {
      type: String,
      enum: DEVELOPMENT_TASK_TYPES,
      required: true,
      index: true,
    },

    relatedUserStories: {
      type: [String],
      required: true,
      default: [],
    },

    acceptanceCriteria: {
      type: [String],
      required: true,
      default: [],
    },

    dependencies: {
      type: [String],
      required: true,
      default: [],
    },

    targetAreas: {
      type: [String],
      required: true,
      default: [],
    },

    status: {
      type: String,
      enum: DEVELOPMENT_TASK_STATUSES,
      required: true,
      default: "PLANNED",
      index: true,
    },

    attemptCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    startedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

developmentTaskSchema.index(
  {
    projectId: 1,
    taskKey: 1,
  },
  {
    unique: true,
  },
);

developmentTaskSchema.index({
  projectId: 1,
  order: 1,
});

const DevelopmentTaskModel: Model<DevelopmentTask> = model<DevelopmentTask>(
  "DevelopmentTask",
  developmentTaskSchema,
);

export default DevelopmentTaskModel;

