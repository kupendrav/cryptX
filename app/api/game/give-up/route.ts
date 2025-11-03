import { NextRequest } from "next/server";
import { sessions } from "@/lib/state";
import { emit } from "@/lib/emitter";

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json().catch(() => ({}));
  const s = sessions.get(sessionId);
  if (!s) return Response.json({ ok: false });
  
  // Stop the game and timer
  s.running = false;
  s.timeLeft = 0;
  
  // Clear the timer if it exists
  if (s.timer) {
    clearInterval(s.timer);
    s.timer = null;
  }
  
  await emit(sessionId, "modal", { title: "Round ended", body: `Round ended. The secret was: ${s.secret}`, kind: "info" });
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
