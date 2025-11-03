"use client";
import { useEffect, useState, type KeyboardEvent } from "react";
import { getSocket } from "@/lib/socket-client";
import { useSessionId } from "@/lib/useSessionId";
import { Wallet } from "@/components/Wallet";
import { Modal } from "@/components/Modal";

type ModalT = { title: string; body: string; kind?: "info" | "success" | "warn" | "error" } | null;
type State = { score: number; level: number; timeLeft: number; attempts: number; hints: number; cipher: string; rewardsEth?: number };

export default function Page() {
  const sessionId = useSessionId();
  const [state, setState] = useState<State | null>(null);
  const [modal, setModal] = useState<ModalT>(null);
  const [guess, setGuess] = useState("");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

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

  if (!sessionId) {
    return <div className="h-screen grid place-items-center text-slate-300">Loading…</div>;
  }

  // UI helpers
  function openHelp() {
    setModal({
      title: "How to play?",
      body:
        "A cryptography term is selected each round.\n" +
        "An encrypted token shows either the secret or a hint.\n" +
        "Use Hint for a readable clue, then submit a guess before the timer ends.\n" +
        "Correct answers earn +100 plus time bonus and level up.",
      kind: "info",
    });
  }

  function onEnterSubmit(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submit();
  }

  async function copy() {
    if (state?.cipher) {
      await navigator.clipboard.writeText(state.cipher);
      // 3) Copied popup
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
    // 6) Give up popup
    setModal({ title: "Better luck next time", body: "You gave up.", kind: "warn" });
  }

  async function claimReward(address: string, level: number) {
  try {
    const r = await fetch("/api/reward/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, level }),
    });
    const j = await r.json();
    if (!j.ok) {
      alert(`Claim failed: ${j.error || "unknown"}`);
      return;
    }
    const msg = j.explorer ? `Tx: ${j.txHash}\nExplorer: ${j.explorer}` : `Tx: ${j.txHash}`;
    // Use your Modal
    // setModal({ title: "Reward sent", body: msg, kind: "success" });
    alert(`Reward sent!\n${msg}`);
  } catch (e: any) {
    alert(`Claim error: ${String(e?.message ?? e)}`);
  }
}

async function ensureTenderlyChain(targetChainIdDec: number, rpcUrl: string, name: string, symbol = "ETH") {
  const hexChainId = "0x" + targetChainIdDec.toString(16);
  const anyWin = window as any;
  try {
    await anyWin.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hexChainId }] });
  } catch (switchErr: any) {
    if (switchErr?.code === 4902) {
      await anyWin.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{ chainId: hexChainId, chainName: name, nativeCurrency: { name: symbol, symbol, decimals: 18 }, rpcUrls: [rpcUrl] }],
      });
      await anyWin.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hexChainId }] });
    } else {
      throw switchErr;
    }
  }
}


  return (
    <div className="relative h-screen">
      <video className="fixed inset-0 h-full w-full object-cover brightness-[0.9] saturate-[1.05]" src="/crypto.mp4" autoPlay loop muted playsInline />

      <div className="relative z-10 h-full grid grid-rows-[auto_1fr] p-4 md:p-6">
        {/* Header row: left button highlighted in white, title centered with subtitle below */}
        <div className="flex items-center justify-between mb-4">
          <button
            className="btn-base px-6 py-3 rounded-xl bg-white text-black hover:bg-white/90 active:scale-[0.98]"
            onClick={openHelp}
          >
            How to play?
          </button>

          {/* Centered title/subtitle stack */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <h1 className="m-0 text-6xl md:text-7xl font-extrabold tracking-tight drop-shadow text-white">CryptX</h1>
            <div className="text-slate-200 text-xl md:text-2xl mt-4 font-medium">
              Decrypt clues, guess the secret, beat the clock.
            </div>
          </div>

          {/* Right spacer to keep layout balanced */}
          <div className="w-[180px]" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 md:gap-8 mt-6 overflow-hidden">
          <section className="flex flex-col gap-6 md:gap-8 overflow-hidden">
            <div className="card-glass px-8 py-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-slate-200/90 text-xl font-semibold">
                <div>Score: {state?.score ?? 0}</div>
                <div>Time: {state?.timeLeft ?? 0}s</div>
                <div>Attempts: {state?.attempts ?? 0}</div>
                <div>Hints: {state?.hints ?? 0}</div>
              </div>
            </div>

            <div className="card-glass px-8 py-6">
              <div className="text-white font-extrabold text-2xl mb-4">Encrypted clue:</div>
              <div className="rounded-2xl border border-yellow-300 bg-black/40 font-mono text-lg break-words px-6 py-5 mt-3">
                {state?.cipher ?? ""}
              </div>
              <div className="flex gap-4 flex-wrap mt-6">
                <button className="btn-ghost" onClick={copy}>Copy Cipher ⧉</button>
                <button className="btn-cyan" onClick={newEncryptedHint}>New Hint ⟲</button>
              </div>
            </div>

            <div className="card-glass px-8 py-6">
              <div className="text-white font-extrabold text-2xl mb-4">Enter guess or try to decrypt:</div>
              <input
                className="input-glass w-full rounded-2xl border border-yellow-300 bg-black/40 font-mono px-6 py-4 mt-3"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={onEnterSubmit}
                placeholder="Type your guess and press Enter"
              />
              <div className="flex gap-6 flex-wrap items-center mt-6">
                <button className="btn-primary-lg" onClick={submit}>Submit ⏎</button>
                <button className="btn-amber" onClick={hint}>Hint 💡</button>
                <button className="btn-cyan" onClick={newRound}>New Round ⟳</button>
                <div className="flex-1" />
                <button className="btn-rose" onClick={giveUp}>Give Up ✖</button>
              </div>
            </div>
          </section>

          <aside className="card-glass px-8 py-6 h-fit rounded-2xl border border-yellow-300 bg-black/50 font-mono">
            <div className="text-2xl font-bold mb-4">Level: {state?.level ?? 1}</div>
            <div className="text-slate-300 text-lg mb-4">Connect a browser wallet:</div>
            <Wallet rewardsEth={state?.rewardsEth ?? 0} onAddressChange={setWalletAddress} />
            
          </aside>
        </div>
      </div>
      {modal && <Modal title={modal.title} body={modal.body} onClose={() => setModal(null)} />}
    </div>
  );
}
