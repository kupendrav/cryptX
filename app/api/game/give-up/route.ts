import { NextRequest } from "next/server";
import { io } from "../../socket/route";
import { sessions } from "@/lib/state";

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json().catch(() => ({}));
  const s = sessions.get(sessionId);
  if (!s) return Response.json({ ok: false });
  s.running = false;
  io.to(sessionId).emit("modal", { title: "Round ended", body: `Round ended. The secret was: ${s.secret}`, kind: "info" });
  io.to(sessionId).emit("state", { score: s.score, level: s.level, timeLeft: s.timeLeft, attempts: s.attempts, hints: s.hints, cipher: s.cipher });
  return Response.json({ ok: true });
}
