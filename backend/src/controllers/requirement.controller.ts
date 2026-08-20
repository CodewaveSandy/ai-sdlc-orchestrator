import type { Request, Response } from "express";

import { submitProjectRequirement } from "../services/requirement.service";
import type { SubmitRequirementInput } from "../types/requirement.types";

interface ProjectParams {
  projectId: string;
}

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
    console.error("Failed to analyze project requirement", error);

    response.status(500).json({
      success: false,
      message: "Failed to analyze project requirement",
    });
  }
};

