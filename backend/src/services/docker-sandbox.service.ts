import { spawn, type ChildProcessByStdio } from "node:child_process";
import type { Readable } from "node:stream";

import { developmentConfig } from "../config/development";
import type {
  DevelopmentRuntimeStatus,
  SandboxExecutionOptions,
  SandboxExecutionResult,
} from "../types/development.types";
import { AppError } from "../utils/app-error";
import { assertProjectWorkspaceAccessible } from "./workspace.service";

interface ProcessExecutionResult {
  exitCode: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

type SandboxChildProcess = ChildProcessByStdio<null, Readable, Readable>;

const executeProcess = (
  executable: string,
  args: string[],
  timeoutMs: number,
): Promise<ProcessExecutionResult> => {
  return new Promise((resolve, reject) => {
    let child: SandboxChildProcess | undefined;

    try {
      child = spawn(executable, args, {
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      reject(error);

      return;
    }

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let settled = false;

    const timeout = setTimeout(() => {
      timedOut = true;

      child?.kill("SIGKILL");
    }, timeoutMs);

    child.stdout.on("data", (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      if (settled) {
        return;
      }

      settled = true;

      clearTimeout(timeout);

      reject(error);
    });

    child.on("close", (exitCode) => {
      if (settled) {
        return;
      }

      settled = true;

      clearTimeout(timeout);

      resolve({
        exitCode,
        stdout,
        stderr,
        timedOut,
      });
    });
  });
};

export const getDevelopmentRuntimeStatus =
  async (): Promise<DevelopmentRuntimeStatus> => {
    try {
      const result = await executeProcess(
        "docker",
        ["version", "--format", "{{.Server.Version}}"],
        10_000,
      );

      if (result.exitCode !== 0) {
        return {
          dockerAvailable: false,

          workspaceRoot: developmentConfig.workspaceRoot,
        };
      }

      return {
        dockerAvailable: true,

        dockerVersion: result.stdout.trim(),

        workspaceRoot: developmentConfig.workspaceRoot,
      };
    } catch {
      return {
        dockerAvailable: false,

        workspaceRoot: developmentConfig.workspaceRoot,
      };
    }
  };

const normalizeTimeout = (requestedTimeout?: number): number => {
  if (!requestedTimeout) {
    return developmentConfig.defaultTimeoutMs;
  }

  return Math.min(
    Math.max(requestedTimeout, 1_000),

    developmentConfig.maxTimeoutMs,
  );
};

export const executeSandboxCommand = async (
  projectId: string,
  options: SandboxExecutionOptions,
): Promise<SandboxExecutionResult> => {
  const command = options.command.trim();

  if (!command) {
    throw new AppError("Sandbox command is required", 400);
  }

  const runtime = await getDevelopmentRuntimeStatus();

  if (!runtime.dockerAvailable) {
    throw new AppError(
      "Docker is not available. Start Docker Desktop and try again.",
      503,
    );
  }

  const workspacePath = await assertProjectWorkspaceAccessible(projectId);

  const timeoutMs = normalizeTimeout(options.timeoutMs);

  const dockerArguments = [
    "run",
    "--rm",

    "--memory",
    developmentConfig.memoryLimit,

    "--cpus",
    developmentConfig.cpuLimit,

    "--pids-limit",
    developmentConfig.pidsLimit,

    "--cap-drop",
    "ALL",

    "--security-opt",
    "no-new-privileges",

    "--tmpfs",
    "/tmp:rw,noexec,nosuid,size=128m",

    "--workdir",
    "/workspace",

    "--mount",
    `type=bind,source=${workspacePath},target=/workspace`,

    "--env",
    "HOME=/tmp",
  ];

  if (!options.allowNetwork) {
    dockerArguments.push("--network", "none");
  }

  dockerArguments.push(developmentConfig.dockerImage, "sh", "-lc", command);

  const startedAt = Date.now();

  const result = await executeProcess("docker", dockerArguments, timeoutMs);

  return {
    command,

    exitCode: result.exitCode,

    stdout: result.stdout,

    stderr: result.stderr,

    timedOut: result.timedOut,

    durationMs: Date.now() - startedAt,
  };
};

