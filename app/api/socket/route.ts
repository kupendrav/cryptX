import { NextRequest } from "next/server";
import { Server as IOServer } from "socket.io";

const g = global as unknown as { io?: IOServer };

export function getIO() {
  if (!g.io) {
    g.io = new IOServer({ cors: { origin: "*", methods: ["GET","POST"] } });
    // Bind engine path so client default works; Next dev proxies /socket.io to this instance.
    // No explicit httpServer binding in serverless routes; engine runs in-memory for events.
  }
  return g.io;
}

export async function GET(_req: NextRequest) {
  getIO();
  return new Response("ok");
}

export const io = getIO();
