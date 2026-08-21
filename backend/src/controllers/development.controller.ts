import type { Request, Response } from "express";

import {
  getDevelopmentEnvironment,
  initializeDevelopmentEnvironment,
  runDevelopmentSmokeTest,
} from "../services/development-environment.service";
import { AppError } from "../utils/app-error";

interface ProjectParams {
  projectId: string;
}

const handleDevelopmentError = (
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

export const getDevelopmentEnvironmentController = async (
  request: Request<ProjectParams>,
  response: Response,
): Promise<void> => {
  try {
    const environment = await getDevelopmentEnvironment(
      request.params.projectId,
    );

    response.status(200).json({
      success: true,

      data: {
        environment,
      },
    });
  } catch (error) {
    handleDevelopmentError(
      error,
      response,
      "Failed to retrieve development environment",
    );
  }
};

export const initializeDevelopmentEnvironmentController = async (
  request: Request<ProjectParams>,
  response: Response,
): Promise<void> => {
  try {
    const environment = await initializeDevelopmentEnvironment(
      request.params.projectId,
    );

    response.status(200).json({
      success: true,
      message: "Development environment initialized",

      data: {
        environment,
      },
    });
  } catch (error) {
    handleDevelopmentError(
      error,
      response,
      "Failed to initialize development environment",
    );
  }
};

export const runDevelopmentSmokeTestController = async (
  request: Request<ProjectParams>,
  response: Response,
): Promise<void> => {
  try {
    const result = await runDevelopmentSmokeTest(request.params.projectId);

    if (result.timedOut) {
      response.status(408).json({
        success: false,
        message: "Development sandbox smoke test timed out",

        data: {
          result,
        },
      });

      return;
    }

    if (result.exitCode !== 0) {
      response.status(500).json({
        success: false,
        message: "Development sandbox smoke test failed",

        data: {
          result,
        },
      });

      return;
    }

    response.status(200).json({
      success: true,

      message: "Development sandbox is ready",

      data: {
        result,
      },
    });
  } catch (error) {
    handleDevelopmentError(
      error,
      response,
      "Failed to run development sandbox smoke test",
    );
  }
};

