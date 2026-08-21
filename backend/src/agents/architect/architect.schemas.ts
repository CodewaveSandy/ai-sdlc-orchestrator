import { z } from "zod";

export const architectureTechnologyChoiceSchema = z.object({
  area: z.string(),
  choice: z.string(),
  rationale: z.string(),
});

export const architectureComponentSchema = z.object({
  componentKey: z.string().describe("Stable identifier such as C1, C2, C3."),

  name: z.string(),

  responsibility: z.string(),

  interfaces: z.array(z.string()),

  dependencies: z
    .array(z.string())
    .describe("componentKey values this component depends on."),
});

export const architectureDataEntitySchema = z.object({
  name: z.string(),
  purpose: z.string(),
  keyFields: z.array(z.string()),
});

export const architectureApiEndpointSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),

  path: z.string(),
  purpose: z.string(),
});

export const architectureApiDomainSchema = z.object({
  name: z.string(),
  responsibility: z.string(),
  endpoints: z.array(architectureApiEndpointSchema),
});

export const nonFunctionalRequirementSchema = z.object({
  category: z.enum([
    "PERFORMANCE",
    "SECURITY",
    "RELIABILITY",
    "SCALABILITY",
    "OBSERVABILITY",
    "MAINTAINABILITY",
    "ACCESSIBILITY",
  ]),

  requirement: z.string(),
  target: z.string(),
});

export const architectureRiskSchema = z.object({
  risk: z.string(),
  impact: z.string(),
  mitigation: z.string(),
});

export const architectureProposalSchema = z.object({
  architectureSummary: z.string(),

  systemContext: z.string(),

  technologyChoices: z.array(architectureTechnologyChoiceSchema),

  components: z.array(architectureComponentSchema),

  dataEntities: z.array(architectureDataEntitySchema),

  apiDomains: z.array(architectureApiDomainSchema),

  nonFunctionalRequirements: z.array(nonFunctionalRequirementSchema),

  securityConsiderations: z.array(z.string()),

  deploymentStrategy: z.string(),

  architectureDecisions: z.array(z.string()),

  risks: z.array(architectureRiskSchema),
});

export const architectureRevisionSchema = z.object({
  feedback: z.string(),

  previousArchitecture: architectureProposalSchema,

  requestedAt: z.string(),
});

export const architectRunInputSchema = z.object({
  approvedScope: z.object({
    productSummary: z.string(),

    productGoals: z.array(z.string()),

    features: z.array(
      z.object({
        featureKey: z.string(),
        name: z.string(),
        description: z.string(),

        priority: z.enum(["MUST_HAVE", "SHOULD_HAVE", "COULD_HAVE"]),
      }),
    ),

    userStories: z.array(
      z.object({
        storyKey: z.string(),
        featureKey: z.string(),
        title: z.string(),
        description: z.string(),

        acceptanceCriteria: z.array(z.string()),

        priority: z.enum(["MUST_HAVE", "SHOULD_HAVE", "COULD_HAVE"]),

        dependencies: z.array(z.string()),
      }),
    ),

    assumptions: z.array(z.string()),
    outOfScope: z.array(z.string()),
  }),

  revisions: z.array(architectureRevisionSchema).default([]),
});

export type ArchitectureProposal = z.infer<typeof architectureProposalSchema>;

export type ArchitectureRevision = z.infer<typeof architectureRevisionSchema>;

export type ArchitectRunInput = z.infer<typeof architectRunInputSchema>;

