import { zodTextFormat } from "openai/helpers/zod";

import { env } from "../../config/env";
import openai from "../../config/openai";
import {
  PO_SCOPE_GENERATION_INSTRUCTIONS,
  PO_SCOPE_REVISION_INSTRUCTIONS,
} from "./po-scope.prompts";
import {
  productScopeSchema,
  type PoScopeRunInput,
  type ProductScope,
} from "./po-scope.schemas";

export interface PoScopeExecutionResult {
  scope: ProductScope;
  providerResponseId: string;
  model: string;

  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

const createExecutionResult = (
  response: Awaited<ReturnType<typeof openai.responses.parse>>,
): PoScopeExecutionResult => {
  if (!response.output_parsed) {
    throw new Error("PO Agent did not return a valid product scope");
  }

  return {
    scope: response.output_parsed as ProductScope,

    providerResponseId: response.id,

    model: response.model,

    usage: {
      inputTokens: response.usage?.input_tokens ?? 0,

      outputTokens: response.usage?.output_tokens ?? 0,

      totalTokens: response.usage?.total_tokens ?? 0,
    },
  };
};

export const generateProductScope = async (
  projectName: string,
  input: PoScopeRunInput,
): Promise<PoScopeExecutionResult> => {
  const response = await openai.responses.parse({
    model: env.openaiModel,

    instructions: PO_SCOPE_GENERATION_INSTRUCTIONS,

    input: `
Project name:
${projectName}

Original requirement:
${input.rawRequirement}

Validated requirement summary:
${input.requirementAnalysis.requirementSummary}

Requirement assumptions:
${JSON.stringify(input.requirementAnalysis.assumptions, null, 2)}

Clarification history:
${JSON.stringify(input.clarificationRounds, null, 2)}

Generate the product scope for the first release.
`.trim(),

    text: {
      format: zodTextFormat(productScopeSchema, "product_scope"),
    },
  });

  return createExecutionResult(response);
};

export const reviseProductScope = async (
  projectName: string,
  input: PoScopeRunInput,
  currentScope: ProductScope,
  feedback: string,
): Promise<PoScopeExecutionResult> => {
  const response = await openai.responses.parse({
    model: env.openaiModel,

    instructions: PO_SCOPE_REVISION_INSTRUCTIONS,

    input: `
Project name:
${projectName}

Original requirement:
${input.rawRequirement}

Validated requirement summary:
${input.requirementAnalysis.requirementSummary}

Clarification history:
${JSON.stringify(input.clarificationRounds, null, 2)}

Current product scope:
${JSON.stringify(currentScope, null, 2)}

Human review feedback:
${feedback}

Return the complete revised product scope.
`.trim(),

    text: {
      format: zodTextFormat(productScopeSchema, "revised_product_scope"),
    },
  });

  return createExecutionResult(response);
};

