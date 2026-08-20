import { zodTextFormat } from "openai/helpers/zod";

import openai from "../../config/openai";
import { env } from "../../config/env";
import {
  poRequirementAnalysisSchema,
  type PoRequirementAnalysis,
} from "./po.schemas";
import { PO_REQUIREMENT_ANALYSIS_INSTRUCTIONS } from "./po.prompts";

export interface PoAgentExecutionResult {
  analysis: PoRequirementAnalysis;
  providerResponseId: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export const analyzeRequirement = async (
  projectName: string,
  rawRequirement: string,
): Promise<PoAgentExecutionResult> => {
  const response = await openai.responses.parse({
    model: env.openaiModel,

    instructions: PO_REQUIREMENT_ANALYSIS_INSTRUCTIONS,

    input: `
Project name:
${projectName}

Customer requirement:
${rawRequirement}
`.trim(),

    text: {
      format: zodTextFormat(
        poRequirementAnalysisSchema,
        "po_requirement_analysis",
      ),
    },
  });

  if (!response.output_parsed) {
    throw new Error("PO Agent did not return a valid structured response");
  }

  return {
    analysis: response.output_parsed,

    providerResponseId: response.id,

    model: response.model,

    usage: {
      inputTokens: response.usage?.input_tokens ?? 0,
      outputTokens: response.usage?.output_tokens ?? 0,
      totalTokens: response.usage?.total_tokens ?? 0,
    },
  };
};

