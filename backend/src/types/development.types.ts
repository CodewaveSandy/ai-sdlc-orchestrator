export interface DevelopmentRuntimeStatus {
  dockerAvailable: boolean;
  dockerVersion?: string;
  workspaceRoot: string;
}

export interface ProjectWorkspaceState {
  projectId: string;
  path: string;
  exists: boolean;
  createdAt?: string;
}

export interface SandboxExecutionOptions {
  command: string;
  timeoutMs?: number;
  allowNetwork?: boolean;
}

export interface SandboxExecutionResult {
  command: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
  durationMs: number;
}

export interface DevelopmentEnvironmentState {
  runtime: DevelopmentRuntimeStatus;
  workspace: ProjectWorkspaceState;
}

export interface DevelopmentEnvironmentResponse {
  success: boolean;

  data: {
    environment: DevelopmentEnvironmentState;
  };
}

export interface DevelopmentSmokeTestResponse {
  success: boolean;
  message: string;

  data: {
    result: SandboxExecutionResult;
  };
}

