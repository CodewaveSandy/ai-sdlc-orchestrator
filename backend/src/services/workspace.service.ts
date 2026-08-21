import {
  access,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { developmentConfig } from "../config/development";
import type { ProjectWorkspaceState } from "../types/development.types";
import { AppError } from "../utils/app-error";

const ensureWorkspaceRoot = async (): Promise<void> => {
  await mkdir(developmentConfig.workspaceRoot, {
    recursive: true,
  });
};

const getProjectWorkspacePath = (projectId: string): string => {
  return path.resolve(developmentConfig.workspaceRoot, projectId);
};

const assertPathInsideWorkspace = (
  workspacePath: string,
  relativePath: string,
): string => {
  const resolvedPath = path.resolve(workspacePath, relativePath);

  const relative = path.relative(workspacePath, resolvedPath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new AppError("Workspace path escapes the project sandbox", 400);
  }

  return resolvedPath;
};

export const getProjectWorkspace = async (
  projectId: string,
): Promise<ProjectWorkspaceState> => {
  await ensureWorkspaceRoot();

  const workspacePath = getProjectWorkspacePath(projectId);

  try {
    const workspaceStat = await stat(workspacePath);

    return {
      projectId,
      path: workspacePath,
      exists: workspaceStat.isDirectory(),
      createdAt: workspaceStat.birthtime.toISOString(),
    };
  } catch {
    return {
      projectId,
      path: workspacePath,
      exists: false,
    };
  }
};

export const initializeProjectWorkspace = async (
  projectId: string,
): Promise<ProjectWorkspaceState> => {
  await ensureWorkspaceRoot();

  const workspacePath = getProjectWorkspacePath(projectId);

  await mkdir(workspacePath, {
    recursive: true,
  });

  const workspaceStat = await stat(workspacePath);

  return {
    projectId,
    path: workspacePath,
    exists: true,
    createdAt: workspaceStat.birthtime.toISOString(),
  };
};

export const projectWorkspaceExists = async (
  projectId: string,
): Promise<boolean> => {
  const workspace = await getProjectWorkspace(projectId);

  return workspace.exists;
};

export const writeWorkspaceFile = async (
  projectId: string,
  relativePath: string,
  content: string,
): Promise<void> => {
  const workspace = await initializeProjectWorkspace(projectId);

  const targetPath = assertPathInsideWorkspace(workspace.path, relativePath);

  await mkdir(path.dirname(targetPath), {
    recursive: true,
  });

  await writeFile(targetPath, content, "utf8");
};

export const readWorkspaceFile = async (
  projectId: string,
  relativePath: string,
): Promise<string> => {
  const workspace = await getProjectWorkspace(projectId);

  if (!workspace.exists) {
    throw new AppError("Project workspace does not exist", 404);
  }

  const targetPath = assertPathInsideWorkspace(workspace.path, relativePath);

  try {
    return await readFile(targetPath, "utf8");
  } catch {
    throw new AppError("Workspace file not found", 404);
  }
};

export const listWorkspaceFiles = async (
  projectId: string,
  relativePath = ".",
): Promise<string[]> => {
  const workspace = await getProjectWorkspace(projectId);

  if (!workspace.exists) {
    return [];
  }

  const directoryPath = assertPathInsideWorkspace(workspace.path, relativePath);

  try {
    return await readdir(directoryPath);
  } catch {
    throw new AppError("Workspace directory not found", 404);
  }
};

export const deleteWorkspaceFile = async (
  projectId: string,
  relativePath: string,
): Promise<void> => {
  const workspace = await getProjectWorkspace(projectId);

  if (!workspace.exists) {
    throw new AppError("Project workspace does not exist", 404);
  }

  const targetPath = assertPathInsideWorkspace(workspace.path, relativePath);

  if (targetPath === workspace.path) {
    throw new AppError(
      "Cannot delete the project workspace using the file delete operation",
      400,
    );
  }

  await rm(targetPath, {
    recursive: true,
    force: true,
  });
};

export const assertProjectWorkspaceAccessible = async (
  projectId: string,
): Promise<string> => {
  const workspace = await getProjectWorkspace(projectId);

  if (!workspace.exists) {
    throw new AppError("Project workspace does not exist", 404);
  }

  try {
    await access(workspace.path);
  } catch {
    throw new AppError("Project workspace is not accessible", 500);
  }

  return workspace.path;
};

