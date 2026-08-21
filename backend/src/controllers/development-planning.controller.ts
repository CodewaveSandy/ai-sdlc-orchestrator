import type { Request, Response } from "express";

import { getDevelopmentPlanState } from "../services/development-planning.service";
import { AppError } from "../utils/app-error";

interface ProjectParams {
  projectId: string;
}

export const getDevelopmentPlanController = async (
  request: Request<ProjectParams>,
  response: Response,
): Promise<void> => {
  try {
    const state = await getDevelopmentPlanState(request.params.projectId);

    response.status(200).json({
      success: true,

      data: {
        state,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      response.status(error.statusCode).json({
        success: false,
        message: error.message,
      });

      return;
    }

    console.error("Failed to retrieve development plan", error);

    response.status(500).json({
      success: false,

      message: "Failed to retrieve development plan",
    });
  }
};

