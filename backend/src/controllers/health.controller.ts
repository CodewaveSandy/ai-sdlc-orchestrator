import type { Request, Response } from "express";
import mongoose from "mongoose";

const getDatabaseStatus = (): string => {
  switch (mongoose.connection.readyState) {
    case 0:
      return "disconnected";

    case 1:
      return "connected";

    case 2:
      return "connecting";

    case 3:
      return "disconnecting";

    default:
      return "unknown";
  }
};

export const getHealth = (_request: Request, response: Response): void => {
  const databaseStatus = getDatabaseStatus();
  const isDatabaseConnected = databaseStatus === "connected";

  response.status(isDatabaseConnected ? 200 : 503).json({
    success: isDatabaseConnected,
    service: "AI SDLC Orchestrator API",
    status: isDatabaseConnected ? "healthy" : "unhealthy",
    database: {
      status: databaseStatus,
    },
    timestamp: new Date().toISOString(),
  });
};

