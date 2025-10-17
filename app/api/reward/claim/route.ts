import { NextRequest } from "next/server";
import { ethers } from "ethers";

type ClaimBody = { address: string; level: number; captchaToken?: string };

const claimCountByAddress = new Map<string, number>();
const lastClaimAtByIP = new Map<string, number>();

function ipFromHeaders(req: NextRequest) {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0]?.trim()) || req.headers.get("x-real-ip") || "unknown";
}

function okAddress(addr: string) {
  try { return ethers.isAddress(addr); } catch { return false; }
}

export async function POST(req: NextRequest) {
  const { address, level }: ClaimBody = await req.json();
  const ip = ipFromHeaders(req);

  if (!address || !okAddress(address)) return Response.json({ ok: false, error: "invalid_address" }, { status: 400 });
  if (typeof level !== "number" || level < 1) return Response.json({ ok: false, error: "invalid_level" }, { status: 400 });

  const now = Date.now();
  const last = lastClaimAtByIP.get(ip) ?? 0;
  if (now - last < 20_000) return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });

  const maxPerAddr = Number(process.env.FAUCET_MAX_PER_ADDRESS ?? "1");
  const used = claimCountByAddress.get(address) ?? 0;
  if (used >= maxPerAddr) return Response.json({ ok: false, error: "address_quota_exceeded" }, { status: 429 });

  const rpc = process.env.FAUCET_RPC_URL!;
  const pk = process.env.FAUCET_PRIV_KEY!;
  const amountWei = process.env.FAUCET_AMOUNT_WEI ?? "1000000000000000";
  const expectedChainId = BigInt(process.env.FAUCET_CHAIN_ID ?? "0");
  if (!rpc || !pk) return Response.json({ ok: false, error: "faucet_not_configured" }, { status: 500 });

  try {
    const provider = new ethers.JsonRpcProvider(rpc);
    const signer = new ethers.Wallet(pk, provider);

    const net = await provider.getNetwork();
    if (expectedChainId && net.chainId !== expectedChainId) {
      return Response.json({ ok: false, error: "wrong_chain", got: String(net.chainId) }, { status: 500 });
    }

    // Send native token (ETH-equivalent on your VNet)
    const tx = await signer.sendTransaction({
      to: address,
      value: ethers.toBigInt(amountWei),
    });

    claimCountByAddress.set(address, used + 1);
    lastClaimAtByIP.set(ip, now);

    // Optional: return explorer URL if Tenderly explorer is available
    const explorerBase = process.env.FAUCET_EXPLORER_BASE; // e.g., https://dashboard.tenderly.co/explorer/vnet/<account>/<project>/<vnet>/tx/
    const explorer = explorerBase ? `${explorerBase}/${tx.hash}` : null;

    return Response.json({ ok: true, txHash: tx.hash, explorer });
  } catch (e: any) {
    console.error("faucet error", e);
    return Response.json({ ok: false, error: "tx_failed", details: String(e?.message ?? e) }, { status: 500 });
  }
}
