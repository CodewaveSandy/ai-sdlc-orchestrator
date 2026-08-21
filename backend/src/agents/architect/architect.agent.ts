import { zodTextFormat } from "openai/helpers/zod";

import { env } from "../../config/env";
import openai from "../../config/openai";
import {
  ARCHITECTURE_GENERATION_INSTRUCTIONS,
  ARCHITECTURE_REVISION_INSTRUCTIONS,
} from "./architect.prompts";
import {
  architectureProposalSchema,
  type ArchitectureProposal,
  type ArchitectRunInput,
} from "./architect.schemas";

export interface ArchitectExecutionResult {
  architecture: ArchitectureProposal;
  providerResponseId: string;
  model: string;

  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

const createArchitectExecutionResult = (
  response: Awaited<ReturnType<typeof openai.responses.parse>>,
): ArchitectExecutionResult => {
  if (!response.output_parsed) {
    throw new Error(
      "Architect Agent did not return a valid architecture proposal",
    );
  }

  return {
    architecture: response.output_parsed as ArchitectureProposal,

    providerResponseId: response.id,

    model: response.model,

    usage: {
      inputTokens: response.usage?.input_tokens ?? 0,

      outputTokens: response.usage?.output_tokens ?? 0,

      totalTokens: response.usage?.total_tokens ?? 0,
    },
  };
};

export const generateArchitecture = async (
  projectName: string,
  input: ArchitectRunInput,
): Promise<ArchitectExecutionResult> => {
  const response = await openai.responses.parse({
    model: env.openaiModel,

    instructions: ARCHITECTURE_GENERATION_INSTRUCTIONS,

    input: `
Project name:
${projectName}

Approved product scope:
${JSON.stringify(input.approvedScope, null, 2)}

Design the technical architecture required to implement this approved scope.
`.trim(),

    text: {
      format: zodTextFormat(
        architectureProposalSchema,
        "architecture_proposal",
      ),
    },
  });

  return createArchitectExecutionResult(response);
};

export const reviseArchitecture = async (
  projectName: string,
  input: ArchitectRunInput,
  currentArchitecture: ArchitectureProposal,
  feedback: string,
): Promise<ArchitectExecutionResult> => {
  const response = await openai.responses.parse({
    model: env.openaiModel,

    instructions: ARCHITECTURE_REVISION_INSTRUCTIONS,

    input: `
Project name:
${projectName}

Approved product scope:
${JSON.stringify(input.approvedScope, null, 2)}

Current architecture proposal:
${JSON.stringify(currentArchitecture, null, 2)}

Human review feedback:
${feedback}

Return the complete revised architecture proposal.
`.trim(),

    text: {
      format: zodTextFormat(
        architectureProposalSchema,
        "revised_architecture_proposal",
      ),
    },
  });

  return createArchitectExecutionResult(response);
};

