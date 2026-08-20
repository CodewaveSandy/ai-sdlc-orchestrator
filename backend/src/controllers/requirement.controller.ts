import type { Request, Response } from "express";

import {
  getProjectPoWorkflowState,
  submitPoClarificationAnswers,
  submitProjectRequirement,
} from "../services/requirement.service";
import type {
  SubmitClarificationAnswersInput,
  SubmitRequirementInput,
} from "../types/requirement.types";
import { AppError } from "../utils/app-error";

interface ProjectParams {
  projectId: string;
}

const handleControllerError = (
  error: unknown,
  response: Response,
  fallbackMessage: string,
): void => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  console.error(fallbackMessage, error);

  response.status(500).json({
    success: false,
    message: fallbackMessage,
  });
};

export const submitRequirementController = async (
  request: Request<ProjectParams, unknown, SubmitRequirementInput>,
  response: Response,
): Promise<void> => {
  try {
    const { projectId } = request.params;

    const requirement = request.body.requirement?.trim();

    if (!requirement) {
      response.status(400).json({
        success: false,
        message: "Requirement is required",
      });

      return;
    }

    if (requirement.length < 20) {
      response.status(400).json({
        success: false,
        message: "Requirement must contain at least 20 characters",
      });

      return;
    }

    const result = await submitProjectRequirement(projectId, requirement);

    if (!result) {
      response.status(404).json({
        success: false,
        message: "Project not found",
      });

      return;
    }

    response.status(200).json({
      success: true,

      message:
        result.status === "WAITING_FOR_HUMAN"
          ? "PO Agent requires clarification"
          : "PO Agent has enough information to proceed",

      data: result,
    });
  } catch (error) {
    handleControllerError(
      error,
      response,
      "Failed to analyze project requirement",
    );
  }
};

export const getPoWorkflowStateController = async (
  request: Request<ProjectParams>,
  response: Response,
): Promise<void> => {
  try {
    const { projectId } = request.params;

    const state = await getProjectPoWorkflowState(projectId);

    response.status(200).json({
      success: true,
      data: {
        state,
      },
    });
  } catch (error) {
    handleControllerError(
      error,
      response,
      "Failed to retrieve PO workflow state",
    );
  }
};

export const submitPoClarificationsController = async (
  request: Request<ProjectParams, unknown, SubmitClarificationAnswersInput>,
  response: Response,
): Promise<void> => {
  try {
    const { projectId } = request.params;

    const { agentRunId, answers } = request.body;

    if (!agentRunId?.trim()) {
      response.status(400).json({
        success: false,
        message: "Agent run ID is required",
      });

      return;
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      response.status(400).json({
        success: false,
        message: "Clarification answers are required",
      });

      return;
    }

    const state = await submitPoClarificationAnswers(
      projectId,
      agentRunId.trim(),
      answers,
    );

    response.status(200).json({
      success: true,

      message:
        state.status === "WAITING_FOR_HUMAN"
          ? "PO Agent requires additional clarification"
          : "PO Agent has enough information to proceed",

      data: {
        state,
      },
    });
  } catch (error) {
    handleControllerError(
      error,
      response,
      "Failed to submit clarification answers",
    );
  }
};

