import { model, Schema, type HydratedDocument, type Model } from "mongoose";

import {
  AGENT_RUN_STATUSES,
  AGENT_TASK_TYPES,
  AGENT_TYPES,
  type AgentRun,
} from "../types/agent-run.types";

export type AgentRunDocument = HydratedDocument<AgentRun>;

const agentRunUsageSchema = new Schema(
  {
    inputTokens: {
      type: Number,
      required: true,
      min: 0,
    },

    outputTokens: {
      type: Number,
      required: true,
      min: 0,
    },

    totalTokens: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const agentRunSchema = new Schema<AgentRun>(
  {
    projectId: {
      type: String,
      required: true,
      index: true,
    },

    agentType: {
      type: String,
      enum: AGENT_TYPES,
      required: true,
      index: true,
    },

    taskType: {
      type: String,
      enum: AGENT_TASK_TYPES,
      index: true,
    },

    status: {
      type: String,
      enum: AGENT_RUN_STATUSES,
      default: "CREATED",
      required: true,
      index: true,
    },

    modelName: {
      type: String,
      required: true,
    },

    input: {
      type: Schema.Types.Mixed,
      required: true,
    },

    output: {
      type: Schema.Types.Mixed,
    },

    providerResponseId: {
      type: String,
    },

    usage: {
      type: agentRunUsageSchema,
    },

    error: {
      type: String,
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

agentRunSchema.index({
  projectId: 1,
  agentType: 1,
  taskType: 1,
  createdAt: -1,
});

const AgentRunModel: Model<AgentRun> = model<AgentRun>(
  "AgentRun",
  agentRunSchema,
);

export default AgentRunModel;

