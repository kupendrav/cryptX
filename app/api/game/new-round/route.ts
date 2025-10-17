import { NextRequest } from "next/server";
import { sessions, RoundState, SECRETS, ROUND_TIME, ATTEMPTS, HINTS } from "@/lib/state";
import { genKey, encryptString } from "@/lib/crypto";
import { emit } from "@/lib/emitter";

function ensureState(sessionId: string): RoundState {
  let s = sessions.get(sessionId);
  if (!s) {
    s = {
      key: null, secret: "", hint: "", cipher: "",
      attempts: ATTEMPTS, hints: HINTS, timeLeft: ROUND_TIME,
      score: 0, level: 1, running: false, timer: null,
    };
    sessions.set(sessionId, s);
  }
  return s;
}

function statePayload(s: RoundState) {
  return { score: s.score, level: s.level, timeLeft: s.timeLeft, attempts: s.attempts, hints: s.hints, cipher: s.cipher };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { sessionId?: string } | null;
  if (!body?.sessionId) return Response.json({ error: "missing sessionId" }, { status: 400 });
  const sessionId = body.sessionId;

  const s = ensureState(sessionId);

  // Start a fresh round
  s.key = await genKey();
  const [secret, hint] = SECRETS[(Math.random() * SECRETS.length) | 0];
  s.secret = secret;
  s.hint = hint;
  s.attempts = ATTEMPTS;
  s.hints = HINTS;
  s.timeLeft = ROUND_TIME;
  s.running = true;

  const clue = Math.random() < 0.5 ? secret : hint;
  s.cipher = await encryptString(s.key, clue);

  // Clear any previous timer, start ticking, and relay events
  if (s.timer) clearInterval(s.timer);
  s.timer = setInterval(async () => {
    if (!s.running) return;
    s.timeLeft -= 1;
    await emit(sessionId, "tick", { timeLeft: s.timeLeft });
    if (s.timeLeft <= 0) {
      s.timeLeft = 0;
      s.running = false;
      await emit(sessionId, "modal", { title: "Time up", body: `Time up! The secret was: ${s.secret}`, kind: "error" });
      await emit(sessionId, "state", statePayload(s));
      clearInterval(s.timer!);
      s.timer = null;
    }
  }, 1000);

  // Push initial state to the room via relay
  await emit(sessionId, "state", statePayload(s));

  // Also return state so UI can render immediately
  return Response.json(statePayload(s));
}
