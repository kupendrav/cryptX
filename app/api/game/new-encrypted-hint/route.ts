// app/api/game/new-encrypted-hint/route.ts
import { NextRequest } from "next/server";
import { sessions } from "@/lib/state";
import { encryptString } from "@/lib/crypto";
import { emit } from "@/lib/emitter";

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json().catch(() => ({}));
  const s = sessions.get(sessionId);
  if (!s || !s.running || !s.key) return Response.json({ ok: false });

  const clue = Math.random() < 0.5 ? s.secret : s.hint;
  s.cipher = await encryptString(s.key, clue);

  // Push new cipher to clients
  await emit(sessionId, "state", {
    score: s.score,
    level: s.level,
    timeLeft: s.timeLeft,
    attempts: s.attempts,
    hints: s.hints,
    cipher: s.cipher,
    rewardsEth: s.rewardsEth,
  });

  return Response.json({ ok: true });
}
