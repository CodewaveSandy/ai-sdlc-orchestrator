import type { Server } from "node:http";

import app from "./app";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { env } from "./config/env";

let server: Server | null = null;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    server = app.listen(env.port, () => {
      console.log(
        `AI SDLC Orchestrator API running on http://localhost:${env.port}`,
      );
    });
  } catch (error) {
    console.error("Failed to start AI SDLC Orchestrator API");

    if (error instanceof Error) {
      console.error(error.message);
    }

    process.exit(1);
  }
};

const shutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      try {
        await disconnectDatabase();
        process.exit(0);
      } catch (error) {
        console.error("Error while shutting down");

        if (error instanceof Error) {
          console.error(error.message);
        }

        process.exit(1);
      }
    });

    return;
  }

  await disconnectDatabase();
  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void startServer();

