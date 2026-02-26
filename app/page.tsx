"use client";
import { useEffect, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { getSocket } from "@/lib/socket-client";
import { useSessionId } from "@/lib/useSessionId";
import { Wallet } from "@/components/Wallet";
import { Modal } from "@/components/Modal";
import { Leaderboard } from "@/components/Leaderboard";
import { UsernamePrompt } from "@/components/UsernamePrompt";

type ModalT = { title: string; body: string; kind?: "info" | "success" | "warn" | "error" } | null;
type State = { score: number; level: number; timeLeft: number; attempts: number; hints: number; cipher: string; rewardsEth?: number };

export default function Page() {
  const sessionId = useSessionId();
  const [state, setState] = useState<State | null>(null);
  const [modal, setModal] = useState<ModalT>(null);
  const [guess, setGuess] = useState("");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // Load username from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("cryptx_username");
      if (stored) setUsername(stored);
    }
  }, []);

  // Rough player position estimate
  function getPlayerPosition(): number {
    return Math.max(1, Math.min(10, 11 - Math.floor((state?.score ?? 0) / 300)));
  }

  async function api(path: string, body: any) {
    const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  useEffect(() => {
    if (!sessionId) return;
    const socket = getSocket();

    const start = async () => {
      if (!socket.connected) {
        socket.once("connect", async () => {
          socket.emit("join", { sessionId });
          await api("/api/game/new-round", { sessionId });
        });
      } else {
        socket.emit("join", { sessionId });
        await api("/api/game/new-round", { sessionId });
      }
    };

    // listeners
    const onState = (s: State) => setState(s);
    const onTick = (t: { timeLeft: number }) => setState((p) => (p ? { ...p, timeLeft: t.timeLeft } : p));
    const onModal = (m: ModalT) => setModal(m);
    socket.on("state", onState);
    socket.on("tick", onTick);
    socket.on("modal", onModal);

    start();

    return () => {
      socket.off("state", onState);
      socket.off("tick", onTick);
      socket.off("modal", onModal);
    };
  }, [sessionId]);

  if (!username) {
    return (
      <>
        <video className="fixed inset-0 h-full w-full object-cover brightness-[0.9] saturate-[1.05]" src="/crypto.mp4" autoPlay loop muted playsInline />
        <UsernamePrompt onNameSet={setUsername} />
      </>
    );
  }

  if (!sessionId) {
    return <div className="h-screen grid place-items-center text-slate-300 text-lg">Loading…</div>;
  }

  // UI helpers
  function openHelp() {
    setModal({
      title: "How to play?",
      body:
        "A cryptography term is selected each round.\n" +
        "An encrypted token shows either the secret or a hint.\n" +
        "Use Hint for a readable clue, then submit a guess before the timer ends.\n" +
        "Correct answers earn +100 plus time bonus and level up.\n\n" +
        "⚠️ Points & virtual ETH are for fun only — not real cryptocurrency!",
      kind: "info",
    });
  }

  function onEnterSubmit(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submit();
  }

  async function copy() {
    if (state?.cipher) {
      await navigator.clipboard.writeText(state.cipher);
      setModal({ title: "Copied!", body: "Cipher copied to clipboard.", kind: "success" });
    }
  }

  async function newEncryptedHint() {
    if (!sessionId) return;
    await api("/api/game/new-encrypted-hint", { sessionId });
  }

  async function submit() {
  if (!guess.trim()) {
    setModal({ title: "Submit", body: "Enter a guess first.", kind: "info" });
    return;
  }
  if (!sessionId) return;

  // Fire the request and rely on server socket modal + state to update UI.
  await api("/api/game/submit-guess", { sessionId, text: guess, walletAddress }).catch(console.error);

  setGuess("");
}


  async function hint() {
    if (!sessionId) return;
    // Server will send the hint modal with the actual hint text
    await api("/api/game/reveal-hint", { sessionId });
  }

  
  async function newRound() {
    if (!sessionId) return;
    await api("/api/game/new-round", { sessionId });
    setGuess("");
  }

  async function giveUp() {
    if (!sessionId) return;
    await api("/api/game/give-up", { sessionId });
    setModal({ title: "Better luck next time", body: "You gave up.", kind: "warn" });
  }


  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background video */}
      <video className="fixed inset-0 h-full w-full object-cover brightness-[0.9] saturate-[1.05] -z-10" src="/crypto.mp4" autoPlay loop muted playsInline />

      {/* ─── HEADER ─── */}
      <header className="relative z-10 flex flex-col sm:flex-row items-center justify-between px-3 sm:px-6 py-3 sm:py-4 gap-2">
        {/* Left: How to play + Learn */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            className="rounded-xl bg-white text-black font-semibold text-sm sm:text-base px-3 sm:px-5 py-2 sm:py-2.5 hover:bg-white/90 active:scale-[0.98] transition"
            onClick={openHelp}
          >
            How to play?
          </button>
          <Link
            href="/learn"
            className="rounded-xl bg-yellow-400 text-black font-semibold text-sm sm:text-base px-3 sm:px-5 py-2 sm:py-2.5 hover:bg-yellow-300 active:scale-[0.98] transition no-underline"
          >
            Learn Decryption
          </Link>
        </div>

        {/* Center: Title */}
        <div className="text-center order-first sm:order-none">
          <h1 className="m-0 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow text-white leading-tight">
            CryptX
          </h1>
          <div className="text-slate-200 text-sm sm:text-base md:text-lg mt-1 font-medium">
            Decrypt clues, guess the secret, beat the clock.
          </div>
        </div>

        {/* Right: Player info */}
        <div className="flex items-center gap-3 shrink-0 card-glass rounded-xl px-3 sm:px-4 py-2">
          <div className="text-right">
            <div className="text-yellow-300 font-bold text-sm sm:text-base truncate max-w-[120px] sm:max-w-[160px]">{username}</div>
            <div className="text-slate-400 text-xs sm:text-sm">Rank #{getPlayerPosition()} • {state?.score ?? 0} pts</div>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center text-sm sm:text-base">
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="relative z-10 flex-1 px-3 sm:px-6 py-2 overflow-y-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4 sm:gap-6">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-4 sm:gap-5">
            {/* Score bar */}
            <div className="card-glass rounded-2xl px-4 sm:px-6 py-3 sm:py-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 text-slate-200/90 text-sm sm:text-base font-semibold">
                <div>Score: {state?.score ?? 0}</div>
                <div>Level: {state?.level ?? 1}</div>
                <div>Time: {state?.timeLeft ?? 0}s</div>
                <div>Attempts: {state?.attempts ?? 0}</div>
                <div>Hints: {state?.hints ?? 0}</div>
              </div>
            </div>

            {/* Encrypted clue */}
            <div className="card-glass rounded-2xl px-4 sm:px-6 py-3 sm:py-4">
              <div className="text-white font-extrabold text-lg sm:text-xl mb-2">Encrypted clue:</div>
              <div className="rounded-xl border border-yellow-300 bg-black/40 font-mono text-xs sm:text-sm break-all px-3 sm:px-5 py-3 sm:py-4">
                {state?.cipher ?? ""}
              </div>
              <div className="flex gap-2 sm:gap-3 flex-wrap mt-3 sm:mt-4">
                <button className="btn-ghost text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2" onClick={copy}>Copy ⧉</button>
                <button className="btn-cyan text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2" onClick={newEncryptedHint}>New Hint ⟲</button>
              </div>
            </div>

            {/* Guess box */}
            <div className="card-glass rounded-2xl px-4 sm:px-6 py-3 sm:py-4">
              <div className="text-white font-extrabold text-lg sm:text-xl mb-2">Enter guess or try to decrypt:</div>
              <input
                className="w-full rounded-xl border border-yellow-300 bg-black/40 text-white font-mono text-sm sm:text-base px-3 sm:px-5 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-yellow-400/60 placeholder-slate-500"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={onEnterSubmit}
                placeholder="Type your guess and press Enter"
              />
              <div className="flex gap-2 sm:gap-3 flex-wrap items-center mt-3 sm:mt-4">
                <button className="btn-primary-lg text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-2.5" onClick={submit}>Submit ⏎</button>
                <button className="btn-amber text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-2.5" onClick={hint}>Hint 💡</button>
                <button className="btn-cyan text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-2.5" onClick={newRound}>New Round ⟳</button>
                <div className="flex-1" />
                <button className="btn-rose text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-2.5" onClick={giveUp}>Give Up ✖</button>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="card-glass rounded-2xl px-4 sm:px-6 py-3 sm:py-4">
              <Leaderboard playerName={username} playerScore={state?.score ?? 0} />
            </div>
          </div>

          {/* RIGHT COLUMN (sidebar) */}
          <aside className="flex flex-col gap-4 sm:gap-5">
            {/* Wallet card */}
            <div className="card-glass rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-yellow-300/30">
              <div className="text-lg sm:text-xl font-bold text-white mb-2">Level: {state?.level ?? 1}</div>
              <div className="text-slate-300 text-sm sm:text-base mb-3">Connect a browser wallet:</div>
              <Wallet rewardsEth={state?.rewardsEth ?? 0} onAddressChange={setWalletAddress} />
            </div>

            {/* Disclaimer card */}
            <div className="card-glass rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-rose-400/30">
              <div className="text-rose-400 font-bold text-base sm:text-lg mb-1">⚠️ Disclaimer</div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed m-0">
                All points, levels, and virtual ETH earned in CryptX are <strong className="text-white">for entertainment purposes only</strong>.
                They do not represent real Ethereum or any cryptocurrency. No real money or tokens are awarded.
                The &quot;virtual ETH&quot; is a fun in-game metric (100 points = 1 virtual ETH) and holds <strong className="text-white">no monetary value</strong>.
                Play responsibly and enjoy the game!
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 text-center py-3 sm:py-4 text-slate-400 text-xs sm:text-sm">
        © {new Date().getFullYear()} CryptX. Made with ❤️ by Kupendra. All rights reserved.
      </footer>

      {modal && <Modal title={modal.title} body={modal.body} onClose={() => setModal(null)} />}
    </div>
  );
}
