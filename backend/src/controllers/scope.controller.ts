import type { Request, Response } from "express";

import {
  approveScopeAndContinue,
  reviseScopeAndContinue,
  startScopeGeneration,
} from "../services/orchestration.service";
import { getProjectScopeState } from "../services/scope.service";
import type { ApproveScopeInput, ReviseScopeInput } from "../types/scope.types";
import { AppError } from "../utils/app-error";

interface ProjectParams {
  projectId: string;
}

const handleScopeError = (
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

export const getScopeStateController = async (
  request: Request<ProjectParams>,
  response: Response,
): Promise<void> => {
  try {
    const state = await getProjectScopeState(request.params.projectId);

    response.status(200).json({
      success: true,
      data: {
        state,
      },
    });
  } catch (error) {
    handleScopeError(error, response, "Failed to retrieve product scope");
  }
};

export const generateScopeController = async (
  request: Request<ProjectParams>,
  response: Response,
): Promise<void> => {
  try {
    const state = await startScopeGeneration(request.params.projectId);

    response.status(200).json({
      success: true,
      message: "Product scope generated and ready for human review",

      data: {
        state,
      },
    });
  } catch (error) {
    handleScopeError(error, response, "Failed to generate product scope");
  }
};

export const reviseScopeController = async (
  request: Request<ProjectParams, unknown, ReviseScopeInput>,
  response: Response,
): Promise<void> => {
  try {
    const { agentRunId, feedback } = request.body;

    if (!agentRunId?.trim()) {
      response.status(400).json({
        success: false,
        message: "Agent run ID is required",
      });

      return;
    }

    if (!feedback?.trim()) {
      response.status(400).json({
        success: false,
        message: "Revision feedback is required",
      });

      return;
    }

    const state = await reviseScopeAndContinue(
      request.params.projectId,
      agentRunId.trim(),
      feedback.trim(),
    );

    response.status(200).json({
      success: true,
      message: "Product scope revised and ready for review",

      data: {
        state,
      },
    });
  } catch (error) {
    handleScopeError(error, response, "Failed to revise product scope");
  }
};

export const approveScopeController = async (
  request: Request<ProjectParams, unknown, ApproveScopeInput>,
  response: Response,
): Promise<void> => {
  try {
    const { agentRunId } = request.body;

    if (!agentRunId?.trim()) {
      response.status(400).json({
        success: false,
        message: "Agent run ID is required",
      });

      return;
    }

    const state = await approveScopeAndContinue(
      request.params.projectId,
      agentRunId.trim(),
    );

    response.status(200).json({
      success: true,
      message: "Product scope approved",

      data: {
        state,
      },
    });
  } catch (error) {
    handleScopeError(error, response, "Failed to approve product scope");
  }
};

