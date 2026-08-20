import { z } from "zod";

export const poRequirementAnalysisSchema = z.object({
  decision: z.enum(["NEEDS_CLARIFICATION", "READY_FOR_SCOPE"]),

  requirementSummary: z
    .string()
    .describe(
      "A concise Product Owner understanding of what the customer wants to build.",
    ),

  clarificationQuestions: z
    .array(z.string())
    .describe(
      "Important customer-facing questions that must be answered before creating a reliable product scope. Must be empty when decision is READY_FOR_SCOPE.",
    ),

  assumptions: z
    .array(z.string())
    .describe(
      "Reasonable assumptions that can safely be made without blocking product discovery.",
    ),
});

export type PoRequirementAnalysis = z.infer<typeof poRequirementAnalysisSchema>;

