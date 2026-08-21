import type { Server as HttpServer } from "node:http";

import { Server as SocketIoServer, type Socket } from "socket.io";

import { env } from "../config/env";

let io: SocketIoServer | null = null;

const getProjectRoom = (projectId: string): string => {
  return `project:${projectId}`;
};

const handleConnection = (socket: Socket): void => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("project:join", (projectId: unknown) => {
    if (typeof projectId !== "string" || !projectId.trim()) {
      return;
    }

    const normalizedProjectId = projectId.trim();

    void socket.join(getProjectRoom(normalizedProjectId));
  });

  socket.on("project:leave", (projectId: unknown) => {
    if (typeof projectId !== "string" || !projectId.trim()) {
      return;
    }

    const normalizedProjectId = projectId.trim();

    void socket.leave(getProjectRoom(normalizedProjectId));
  });

  socket.on("projects:join", () => {
    void socket.join("projects");
  });

  socket.on("projects:leave", () => {
    void socket.leave("projects");
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${socket.id} (${reason})`);
  });
};

export const initializeSocketServer = (
  httpServer: HttpServer,
): SocketIoServer => {
  if (io) {
    return io;
  }

  io = new SocketIoServer(httpServer, {
    cors: {
      origin: env.corsOrigin,
      credentials: true,
    },
  });

  io.on("connection", handleConnection);

  console.log("Socket.IO realtime server initialized");

  return io;
};

export const getSocketServer = (): SocketIoServer | null => {
  return io;
};

export const getProjectSocketRoom = getProjectRoom;

export const closeSocketServer = async (): Promise<void> => {
  if (!io) {
    return;
  }

  await new Promise<void>((resolve) => {
    io?.close(() => {
      resolve();
    });
  });

  io = null;
};

