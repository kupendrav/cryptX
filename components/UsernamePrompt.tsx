"use client";
import { useState, type KeyboardEvent } from "react";

type Props = {
  onNameSet: (name: string) => void;
};

export function UsernamePrompt({ onNameSet }: Props) {
  const [name, setName] = useState("");

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (typeof window !== "undefined") {
      window.localStorage.setItem("cryptx_username", trimmed);
    }
    onNameSet(trimmed);
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submit();
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-[92vw] max-w-md rounded-2xl border border-white/10 bg-black/70 backdrop-blur-2xl shadow-2xl p-6 sm:p-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Welcome to CryptX</h2>
        <p className="text-slate-300 text-base sm:text-lg mb-6">Enter your player name to get started</p>
        <input
          autoFocus
          className="w-full rounded-xl border border-yellow-300 bg-black/40 text-white font-mono text-lg sm:text-xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400/60 placeholder-slate-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={onKey}
          placeholder="Your name..."
          maxLength={20}
        />
        <button
          className="mt-4 w-full rounded-xl bg-yellow-400 text-black font-bold text-lg py-3 hover:bg-yellow-300 active:scale-[0.98] transition disabled:opacity-40"
          onClick={submit}
          disabled={!name.trim()}
        >
          Enter Game
        </button>
      </div>
    </div>
  );
}
