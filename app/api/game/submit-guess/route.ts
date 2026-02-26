import { NextRequest } from "next/server";
import { sessions, SCORE_TIME_BONUS, SCORE_CORRECT } from "@/lib/state";
import { emit } from "@/lib/emitter";
import { ethers } from "ethers";

// Helper to send testnet ETH
async function sendTestnetReward(address: string, amountEth: number): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const rpc = process.env.FAUCET_RPC_URL;
  const pk = process.env.FAUCET_PRIV_KEY;
  
  if (!rpc || !pk) {
    return { success: false, error: "Faucet not configured" };
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpc);
    const signer = new ethers.Wallet(pk, provider);
    
    const amountWei = ethers.parseEther(amountEth.toString());
    
    const tx = await signer.sendTransaction({
      to: address,
      value: amountWei,
    });
    
    await tx.wait();
    return { success: true, txHash: tx.hash };
  } catch (e: any) {
    console.error("Testnet reward error:", e);
    return { success: false, error: e.message };
  }
}

export async function POST(req: NextRequest) {
  const { sessionId, text, walletAddress } = await req.json().catch(() => ({}));
  const s = sessions.get(sessionId);
  if (!s || !s.running) return Response.json({ ok: false });

  // Store wallet address if provided
  if (walletAddress && ethers.isAddress(walletAddress)) {
    s.connectedAddress = walletAddress;
  }

  const guess = String(text || "").trim().toLowerCase();
  const correct = guess === s.secret.toLowerCase();

  if (correct) {
    const timeBonus = s.timeLeft * SCORE_TIME_BONUS;
    s.score += SCORE_CORRECT + timeBonus;
    s.level += 1;
    s.running = false;

    // Calculate virtual ETH rewards (1 ETH per 100 points)
    const newThreshold = Math.floor(s.score / 100);
    const oldThreshold = s.lastRewardThreshold;
    const ethEarned = newThreshold - oldThreshold;

    if (ethEarned > 0) {
      s.rewardsEth += ethEarned;
      s.lastRewardThreshold = newThreshold;

      // Send congratulations message
      await emit(sessionId, "modal", {
        title: "Congratulations!",
        body: `Correct! +${SCORE_CORRECT} and +${timeBonus} time bonus.\nLevel up to ${s.level}.\n\n🎉 You earned ${ethEarned} ETH (virtual)!`,
        kind: "success",
      });

      // If wallet is connected, send testnet ETH
      if (s.connectedAddress) {
        const result = await sendTestnetReward(s.connectedAddress, ethEarned);
        
        if (result.success) {
          await emit(sessionId, "modal", {
            title: "🎁 Testnet Reward Sent!",
            body: `${ethEarned} ETH has been sent to your wallet:\n${s.connectedAddress}\n\nTransaction: ${result.txHash?.slice(0, 10)}...${result.txHash?.slice(-8)}`,
            kind: "success",
          });
        } else {
          await emit(sessionId, "modal", {
            title: "Reward Info",
            body: `Virtual reward: ${ethEarned} ETH earned!\n\n${result.error || "Testnet transfer not available"}`,
            kind: "info",
          });
        }
      }
    } else {
      await emit(sessionId, "modal", {
        title: "Congratulations!",
        body: `Correct! +${SCORE_CORRECT} and +${timeBonus} time bonus.\nLevel up to ${s.level}.`,
        kind: "success",
      });
    }
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
    rewardsEth: s.rewardsEth,
  });

  return Response.json({ ok: true });
}
