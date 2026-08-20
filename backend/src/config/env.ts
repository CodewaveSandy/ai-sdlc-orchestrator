import dotenv from "dotenv";

dotenv.config();

const getRequiredEnvironmentVariable = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const getPort = (): number => {
  const port = Number(process.env.PORT ?? 5001);

  if (Number.isNaN(port)) {
    throw new Error("PORT must be a valid number");
  }

  return port;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: getPort(),
  mongodbUri: getRequiredEnvironmentVariable("MONGODB_URI"),
  corsOrigin: getRequiredEnvironmentVariable("CORS_ORIGIN"),
};

