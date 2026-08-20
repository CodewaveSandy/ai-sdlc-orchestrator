import { z } from "zod";

export const productPrioritySchema = z.enum([
  "MUST_HAVE",
  "SHOULD_HAVE",
  "COULD_HAVE",
]);

export const productFeatureSchema = z.object({
  featureKey: z.string().describe("Stable identifier such as F1, F2, F3."),

  name: z.string(),

  description: z.string(),

  priority: productPrioritySchema,
});

export const productUserStorySchema = z.object({
  storyKey: z.string().describe("Stable identifier such as US1, US2, US3."),

  featureKey: z.string().describe("The featureKey this story belongs to."),

  title: z.string(),

  description: z
    .string()
    .describe("User story written in As a / I want / So that form."),

  acceptanceCriteria: z.array(z.string()),

  priority: productPrioritySchema,

  dependencies: z
    .array(z.string())
    .describe("storyKey values that must be completed first. Empty when none."),
});

export const productScopeSchema = z.object({
  productSummary: z.string(),

  productGoals: z.array(z.string()),

  features: z.array(productFeatureSchema),

  userStories: z.array(productUserStorySchema),

  assumptions: z.array(z.string()),

  outOfScope: z.array(z.string()),
});

export const scopeRevisionSchema = z.object({
  feedback: z.string(),

  previousScope: productScopeSchema,

  requestedAt: z.string(),
});

export const poScopeRunInputSchema = z.object({
  rawRequirement: z.string(),

  requirementAnalysis: z.object({
    requirementSummary: z.string(),
    assumptions: z.array(z.string()),
  }),

  clarificationRounds: z.array(
    z.object({
      questions: z.array(z.string()),
      answers: z.array(z.string()),
      answeredAt: z.string(),
    }),
  ),

  revisions: z.array(scopeRevisionSchema).default([]),
});

export type ProductScope = z.infer<typeof productScopeSchema>;

export type ScopeRevision = z.infer<typeof scopeRevisionSchema>;

export type PoScopeRunInput = z.infer<typeof poScopeRunInputSchema>;

