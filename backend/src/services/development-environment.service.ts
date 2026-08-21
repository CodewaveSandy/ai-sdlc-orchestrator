import type {
  DevelopmentEnvironmentState,
  SandboxExecutionResult,
} from "../types/development.types";
import { AppError } from "../utils/app-error";
import {
  executeSandboxCommand,
  getDevelopmentRuntimeStatus,
} from "./docker-sandbox.service";
import { getProjectById } from "./project.service";
import {
  getProjectWorkspace,
  initializeProjectWorkspace,
} from "./workspace.service";

export const getDevelopmentEnvironment = async (
  projectId: string,
): Promise<DevelopmentEnvironmentState> => {
  const project = await getProjectById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const [runtime, workspace] = await Promise.all([
    getDevelopmentRuntimeStatus(),

    getProjectWorkspace(projectId),
  ]);

  return {
    runtime,
    workspace,
  };
};

export const initializeDevelopmentEnvironment = async (
  projectId: string,
): Promise<DevelopmentEnvironmentState> => {
  const project = await getProjectById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  await initializeProjectWorkspace(projectId);

  return getDevelopmentEnvironment(projectId);
};

export const runDevelopmentSmokeTest = async (
  projectId: string,
): Promise<SandboxExecutionResult> => {
  const project = await getProjectById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  await initializeProjectWorkspace(projectId);

  return executeSandboxCommand(projectId, {
    command:
      'echo "AI SDLC sandbox ready" && node --version && npm --version && pwd',

    timeoutMs: 30_000,

    allowNetwork: false,
  });
};

