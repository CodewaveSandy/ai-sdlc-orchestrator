import path from "node:path";

const resolveWorkspaceRoot = (): string => {
  const configuredRoot = process.env.GENERATED_WORKSPACES_ROOT?.trim();

  if (configuredRoot) {
    return path.resolve(configuredRoot);
  }

  return path.resolve(process.cwd(), "../generated-workspaces");
};

export const developmentConfig = {
  workspaceRoot: resolveWorkspaceRoot(),

  dockerImage:
    process.env.DEVELOPER_DOCKER_IMAGE?.trim() || "node:22-bookworm-slim",

  defaultTimeoutMs: 30_000,

  maxTimeoutMs: 120_000,

  memoryLimit: "512m",

  cpuLimit: "1",

  pidsLimit: "128",
} as const;

