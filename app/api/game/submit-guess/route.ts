import { NextRequest } from "next/server";
import { sessions, SCORE_TIME_BONUS, SCORE_CORRECT } from "@/lib/state";
import { emit } from "@/lib/emitter";

export async function POST(req: NextRequest) {
  const { sessionId, text } = await req.json().catch(() => ({}));
  const s = sessions.get(sessionId);
  if (!s || !s.running) return Response.json({ ok: false });

  const guess = String(text || "").trim().toLowerCase();
  const correct = guess === s.secret.toLowerCase();

  if (correct) {
    const timeBonus = s.timeLeft * SCORE_TIME_BONUS;
    s.score += SCORE_CORRECT + timeBonus;
    s.level += 1;
    s.running = false;
    await emit(sessionId, "modal", {
      title: "Congratulations!",
      body: `Correct! +${SCORE_CORRECT} and +${timeBonus} time bonus.\nLevel up to ${s.level}.`,
      kind: "success",
    });
  } else {
    s.attempts -= 1;
    if (s.attempts <= 0) {
      s.running = false;
      await emit(sessionId, "modal", {
        title: "Out of attempts",
        body: `Out of attempts. Secret was: ${s.secret}`,
        kind: "error",
      });
    } else {
      await emit(sessionId, "modal", {
        title: "Try again",
        body: `Incorrect. Attempts left: ${s.attempts}.`,
        kind: "warn",
      });
    }
  }

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
