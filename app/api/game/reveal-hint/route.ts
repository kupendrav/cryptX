// app/api/game/reveal-hint/route.ts
import { NextRequest } from "next/server";
import { sessions } from "@/lib/state";
import { emit } from "@/lib/emitter";

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json().catch(() => ({}));
  const s = sessions.get(sessionId);
  if (!s || !s.running) return Response.json({ ok: false });

  if (s.hints <= 0) {
    await emit(sessionId, "modal", { title: "Hints", body: "No hints left this round.", kind: "warn" });
    return Response.json({ ok: false });
  }

  s.hints -= 1;

  // Show the actual plaintext hint from server
  await emit(sessionId, "modal", { title: "Hint", body: `Hint: ${s.hint}`, kind: "info" });

  // Also push updated counters so UI reflects remaining hints
  await emit(sessionId, "state", {
    score: s.score,
    level: s.level,
    timeLeft: s.timeLeft,
    attempts: s.attempts,
    hints: s.hints,
    cipher: s.cipher,
  });

  return Response.json({ ok: true });
}
