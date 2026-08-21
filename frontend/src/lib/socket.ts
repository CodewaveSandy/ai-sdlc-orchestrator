import { io, type Socket } from "socket.io-client";

const socketBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!socketBaseUrl) {
  throw new Error("VITE_API_BASE_URL is required for realtime communication");
}

export const socket: Socket = io(socketBaseUrl, {
  autoConnect: false,

  /*
   * Allow Socket.IO to use WebSocket when
   * available while retaining its fallback
   * transport/reconnection behavior.
   */
  transports: ["websocket", "polling"],

  withCredentials: true,

  reconnection: true,

  reconnectionAttempts: Infinity,

  reconnectionDelay: 500,

  reconnectionDelayMax: 5000,

  timeout: 10000,
});

