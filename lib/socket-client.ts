"use client";
import { io as clientIO, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = clientIO("http://localhost:3001", {
      path: "/socket.io",
      transports: ["websocket"],        // try websocket first
      reconnection: true,
      reconnectionDelay: 500,
      timeout: 5000,
      withCredentials: false,
    });
    socket.on("connect", () => console.log("WS connected", socket?.id));
    socket.on("connect_error", (e) => console.error("WS connect_error", e.message));
    socket.on("disconnect", (r) => console.warn("WS disconnected", r));
  }
  return socket;
}
