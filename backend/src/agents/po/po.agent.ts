import { zodTextFormat } from "openai/helpers/zod";

import { env } from "../../config/env";
import openai from "../../config/openai";
import { PO_REQUIREMENT_ANALYSIS_INSTRUCTIONS } from "./po.prompts";
import {
  poRequirementAnalysisSchema,
  type PoClarificationRound,
  type PoRequirementAnalysis,
} from "./po.schemas";

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

const buildClarificationContext = (
  clarificationRounds: PoClarificationRound[],
): string => {
  if (clarificationRounds.length === 0) {
    return "No clarification questions have been answered yet.";
  }

  return clarificationRounds
    .map((round, roundIndex) => {
      const questionAnswerPairs = round.questions
        .map((question, questionIndex) => {
          const answer = round.answers[questionIndex] ?? "No answer provided";

          return [
            `Question ${questionIndex + 1}:`,
            question,
            "",
            "Customer answer:",
            answer,
          ].join("\n");
        })
        .join("\n\n");

      return [
        `Clarification round ${roundIndex + 1}`,
        questionAnswerPairs,
      ].join("\n\n");
    })
    .join("\n\n---\n\n");
};

export const analyzeRequirement = async (
  projectName: string,
  rawRequirement: string,
  clarificationRounds: PoClarificationRound[] = [],
): Promise<PoAgentExecutionResult> => {
  const clarificationContext = buildClarificationContext(clarificationRounds);

  const response = await openai.responses.parse({
    model: env.openaiModel,

    instructions: PO_REQUIREMENT_ANALYSIS_INSTRUCTIONS,

    input: `
Project name:
${projectName}

Original customer requirement:
${rawRequirement}

Clarification history:
${clarificationContext}

Analyze the requirement using the original requirement together with all clarification answers provided so far.

Do not repeat questions that have already been answered unless the customer's answer itself introduced a materially important ambiguity.
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

