import type { Request, Response } from "express";

import {
  approveArchitectureAndContinue,
  reviseArchitectureAndContinue,
} from "../services/orchestration.service";
import { getProjectArchitectureState } from "../services/architecture.service";
import type {
  ApproveArchitectureInput,
  ReviseArchitectureInput,
} from "../types/architecture.types";
import { AppError } from "../utils/app-error";

interface ProjectParams {
  projectId: string;
}

const handleArchitectureError = (
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

export const getArchitectureStateController = async (
  request: Request<ProjectParams>,
  response: Response,
): Promise<void> => {
  try {
    const state = await getProjectArchitectureState(request.params.projectId);

    response.status(200).json({
      success: true,

      data: {
        state,
      },
    });
  } catch (error) {
    handleArchitectureError(
      error,
      response,
      "Failed to retrieve architecture state",
    );
  }
};

export const reviseArchitectureController = async (
  request: Request<ProjectParams, unknown, ReviseArchitectureInput>,
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

    const state = await reviseArchitectureAndContinue(
      request.params.projectId,
      agentRunId.trim(),
      feedback.trim(),
    );

    response.status(200).json({
      success: true,

      message: "Architecture revised and ready for review",

      data: {
        state,
      },
    });
  } catch (error) {
    handleArchitectureError(error, response, "Failed to revise architecture");
  }
};

export const approveArchitectureController = async (
  request: Request<ProjectParams, unknown, ApproveArchitectureInput>,
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

    const state = await approveArchitectureAndContinue(
      request.params.projectId,
      agentRunId.trim(),
    );

    response.status(200).json({
      success: true,

      message: "Architecture approved",

      data: {
        state,
      },
    });
  } catch (error) {
    handleArchitectureError(error, response, "Failed to approve architecture");
  }
};

