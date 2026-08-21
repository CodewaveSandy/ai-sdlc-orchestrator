import { zodTextFormat } from "openai/helpers/zod";

import { env } from "../../config/env";
import openai from "../../config/openai";
import { DEVELOPMENT_PLANNING_INSTRUCTIONS } from "./developer-planning.prompts";
import {
  developmentPlanSchema,
  type DevelopmentPlan,
  type DevelopmentPlanningInput,
} from "./developer-planning.schemas";

export interface DevelopmentPlanningExecutionResult {
  plan: DevelopmentPlan;

  providerResponseId: string;

  model: string;

  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export const generateDevelopmentPlan = async (
  projectName: string,
  input: DevelopmentPlanningInput,
): Promise<DevelopmentPlanningExecutionResult> => {
  const response = await openai.responses.parse({
    model: env.openaiModel,

    instructions: DEVELOPMENT_PLANNING_INSTRUCTIONS,

    input: `
Project name:
${projectName}

Approved product scope:
${JSON.stringify(input.approvedScope, null, 2)}

Approved architecture:
${JSON.stringify(input.approvedArchitecture, null, 2)}

Create the ordered development plan that the Developer Agent should execute.
`.trim(),

    text: {
      format: zodTextFormat(developmentPlanSchema, "development_plan"),
    },
  });

  if (!response.output_parsed) {
    throw new Error(
      "Developer Planning Agent did not return a valid development plan",
    );
  }

  return {
    plan: response.output_parsed,

    providerResponseId: response.id,

    model: response.model,

    usage: {
      inputTokens: response.usage?.input_tokens ?? 0,

      outputTokens: response.usage?.output_tokens ?? 0,

      totalTokens: response.usage?.total_tokens ?? 0,
    },
  };
};

