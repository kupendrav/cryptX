"use client";
import { useMemo } from "react";

const FAKE_NAMES = [
  "CryptoNinja", "BlockMaster", "HashQueen", "CipherLord", "NonceHunter",
  "SatoshiFan", "KeyBreaker", "TokenWiz", "ChainGuru", "ZeroProof",
  "ByteKing", "MerkleNode", "AESwarrior", "BitFlip", "EntropyX",
  "VaultKeeper", "NodeRunner", "GasFeeGhost", "WeiWizard", "DeFiDragon",
  "LedgerLion", "ProofPanda", "SignatureSam", "DecryptDiva", "FernetFox",
];

type LeaderEntry = {
  position: number;
  name: string;
  points: number;
  ethEarned: number;
  usdValue: number;
};

function generateLeaderboard(playerName: string, playerScore: number): LeaderEntry[] {
  const ethPrice = 2450; // approximate ETH price for display
  const entries: LeaderEntry[] = [];

  // Generate 9 random players
  const usedNames = new Set<string>();
  usedNames.add(playerName);

  for (let i = 0; i < 9; i++) {
    let name: string;
    do {
      name = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)];
    } while (usedNames.has(name));
    usedNames.add(name);

    const points = Math.floor(Math.random() * 3000) + 100;
    const ethEarned = points / 100;
    entries.push({
      position: 0,
      name,
      points,
      ethEarned,
      usdValue: parseFloat((ethEarned * ethPrice).toFixed(2)),
    });
  }

  // Add the real player
  const playerEth = playerScore / 100;
  entries.push({
    position: 0,
    name: playerName,
    points: playerScore,
    ethEarned: playerEth,
    usdValue: parseFloat((playerEth * ethPrice).toFixed(2)),
  });

  // Sort by points descending
  entries.sort((a, b) => b.points - a.points);
  entries.forEach((e, idx) => (e.position = idx + 1));

  return entries;
}

type Props = {
  playerName: string;
  playerScore: number;
};

export function Leaderboard({ playerName, playerScore }: Props) {
  const board = useMemo(
    () => generateLeaderboard(playerName, playerScore),
    // Regenerate only when playerName changes, not every score tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playerName]
  );

  // Update the player's live score in the board
  const liveBoard = useMemo(() => {
    const ethPrice = 2450;
    const updated = board.map((e) => {
      if (e.name === playerName) {
        const eth = playerScore / 100;
        return { ...e, points: playerScore, ethEarned: eth, usdValue: parseFloat((eth * ethPrice).toFixed(2)) };
      }
      return e;
    });
    updated.sort((a, b) => b.points - a.points);
    updated.forEach((e, idx) => (e.position = idx + 1));
    return updated;
  }, [board, playerName, playerScore]);

  const playerEntry = liveBoard.find((e) => e.name === playerName);

  return (
    <div className="w-full">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">🏆 Leaderboard</h2>

      {/* Scrollable table wrapper */}
      <div className="overflow-x-auto rounded-xl">
        <table className="w-full text-left text-sm sm:text-base">
          <thead>
            <tr className="text-yellow-300 border-b border-white/10">
              <th className="py-2 px-2 sm:px-3">#</th>
              <th className="py-2 px-2 sm:px-3">Player</th>
              <th className="py-2 px-2 sm:px-3 text-right">Points</th>
              <th className="py-2 px-2 sm:px-3 text-right">ETH</th>
              <th className="py-2 px-2 sm:px-3 text-right">USD</th>
            </tr>
          </thead>
          <tbody>
            {liveBoard.map((entry) => {
              const isPlayer = entry.name === playerName;
              return (
                <tr
                  key={entry.name}
                  className={`border-b border-white/5 ${
                    isPlayer ? "bg-yellow-400/10 text-yellow-200 font-semibold" : "text-slate-300"
                  }`}
                >
                  <td className="py-1.5 px-2 sm:px-3">
                    {entry.position <= 3
                      ? ["🥇", "🥈", "🥉"][entry.position - 1]
                      : entry.position}
                  </td>
                  <td className="py-1.5 px-2 sm:px-3 truncate max-w-[100px] sm:max-w-none">
                    {entry.name} {isPlayer && <span className="text-xs text-yellow-400">(You)</span>}
                  </td>
                  <td className="py-1.5 px-2 sm:px-3 text-right">{entry.points.toLocaleString()}</td>
                  <td className="py-1.5 px-2 sm:px-3 text-right">{entry.ethEarned.toFixed(2)}</td>
                  <td className="py-1.5 px-2 sm:px-3 text-right">${entry.usdValue.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {playerEntry && (
        <div className="mt-2 text-xs sm:text-sm text-slate-400 text-center">
          Your rank: #{playerEntry.position} of {liveBoard.length}
        </div>
      )}
    </div>
  );
}
