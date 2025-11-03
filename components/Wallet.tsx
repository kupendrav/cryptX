"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

type Props = { 
  rewardsEth?: number; 
  onAddressChange?: (address: string | null) => void;
};

export function Wallet({ rewardsEth = 0, onAddressChange }: Props) {
  const [address, setAddress] = useState<string | null>(null);
  const [chain, setChain] = useState<{ name: string; symbol: string } | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [usd, setUsd] = useState<number | null>(null);

  async function connect() {
    const anyWindow = window as any;
    if (!anyWindow.ethereum) {
      alert("Install MetaMask to connect a wallet.");
      return;
    }
    const provider = new ethers.BrowserProvider(anyWindow.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const network = await provider.getNetwork();
    const balWei = await provider.getBalance(accounts[0]);
    setAddress(accounts[0]);
    setChain({ name: String(network.name), symbol: "ETH" }); // for testnets it's still ETH
    setBalance(ethers.formatEther(balWei));
    
    // Notify parent component
    if (onAddressChange) {
      onAddressChange(accounts[0]);
    }
  }

  useEffect(() => {
    // Optional: fetch USD price
    async function loadPrice() {
      try {
        const r = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd");
        const j = await r.json();
        setUsd(j?.ethereum?.usd ?? null);
      } catch {
        setUsd(null);
      }
    }
    loadPrice();
  }, []);

  const usdStr = usd && address ? (Number(balance) * usd).toFixed(2) : null;

  return (
    <div className="space-y-3">
      <div className="text-lg text-slate-300">Wallet: {address ? `${address.slice(0,6)}...${address.slice(-4)}` : "Not connected"}</div>
      {address && (
        <div className="text-lg text-slate-300">
          Chain: {chain?.name ?? "Unknown"} • Balance: {balance} {chain?.symbol ?? "ETH"}{usdStr ? ` (~$${usdStr})` : ""}
        </div>
      )}
      <button className="btn-green w-full text-lg" onClick={connect}>{address ? "Connected" : "Connect Wallet"}</button>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-slate-200 font-semibold text-xl">Virtual rewards</div>
        <div className="text-slate-300 text-lg">100 points = 1 ETH (virtual)</div>
        <div className="mt-2 text-2xl font-bold">{rewardsEth} ETH</div>
      </div>
    </div>
  );
}
