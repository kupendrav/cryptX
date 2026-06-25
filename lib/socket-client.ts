"use client";
import { io as clientIO, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const url =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== "undefined" ? window.location.origin : "http://localhost:3001");

    socket = clientIO(url, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      withCredentials: true,
    });
    socket.on("connect", () => console.log("WS connected", socket?.id));
    socket.on("connect_error", (e) => console.error("WS connect_error", e.message));
    socket.on("disconnect", (r) => console.warn("WS disconnected", r));
  }
  return socket;
}
