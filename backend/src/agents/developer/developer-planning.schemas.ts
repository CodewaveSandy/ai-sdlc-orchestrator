import { z } from "zod";

import { architectureProposalSchema } from "../architect/architect.schemas";
import { productScopeSchema } from "../po/po-scope.schemas";

export const DEVELOPMENT_TASK_TYPES = [
  "SCAFFOLD",
  "BACKEND",
  "FRONTEND",
  "DATABASE",
  "INTEGRATION",
  "TESTING",
  "CONFIGURATION",
] as const;

export const developmentTaskTypeSchema = z.enum(DEVELOPMENT_TASK_TYPES);

export const developmentPlanTaskSchema = z.object({
  taskKey: z
    .string()
    .describe("Sequential stable identifier such as DEV-1, DEV-2, DEV-3."),

  title: z.string(),

  description: z.string(),

  objective: z.string(),

  taskType: developmentTaskTypeSchema,

  relatedUserStories: z
    .array(z.string())
    .describe(
      "User story keys from the approved product scope, such as US1 and US2.",
    ),

  acceptanceCriteria: z
    .array(z.string())
    .describe(
      "Concrete conditions that must be satisfied before this development task is complete.",
    ),

  dependencies: z
    .array(z.string())
    .describe("Development task keys this task depends on, such as DEV-1."),

  targetAreas: z
    .array(z.string())
    .describe(
      "Likely implementation areas such as backend, frontend, database, tests, configuration.",
    ),
});

export const developmentPlanSchema = z.object({
  implementationSummary: z.string(),

  executionStrategy: z.string(),

  tasks: z.array(developmentPlanTaskSchema).min(1),
});

export const developmentPlanningInputSchema = z.object({
  approvedScope: productScopeSchema,

  approvedArchitecture: architectureProposalSchema,
});

export type DevelopmentPlan = z.infer<typeof developmentPlanSchema>;

export type DevelopmentPlanTask = z.infer<typeof developmentPlanTaskSchema>;

export type DevelopmentPlanningInput = z.infer<
  typeof developmentPlanningInputSchema
>;

export type DevelopmentTaskType = z.infer<typeof developmentTaskTypeSchema>;

