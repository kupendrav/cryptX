# CryptX — Crypto Guessing Game

A full-stack, real-time cryptography guessing game built with Next.js, Tailwind CSS, and Socket.IO.

Each round, an AES-GCM encrypted clue is generated from a randomly chosen cryptography term. You request readable hints, submit guesses against a ticking timer, climb the leaderboard, and earn virtual ETH. An optional wallet connect shows your on-chain balance and USD estimate.

> **Disclaimer:** All points, levels, and virtual ETH are for entertainment only. They do not represent real Ethereum or any cryptocurrency and hold no monetary value.

---

## Features

- **Real-time gameplay** — Socket.IO pushes ticks, state updates, and modals instantly
- **AES-GCM encrypted clues** — server-side encryption; base64-encoded ciphertext displayed to the player
- **Scoring & levels** — +100 per correct answer, time bonus, automatic level-up
- **Leaderboard** — shows your rank among other players with points, virtual ETH, and USD columns
- **Username prompt** — enter a name on first visit; shown in the header with rank and points
- **Learn page** — dedicated `/learn` route explaining AES-GCM, decryption tips, and all possible terms
- **Wallet connect** — ethers v6 MetaMask integration; address, chain, balance, USD estimate
- **Virtual rewards** — 100 points = 1 virtual ETH (not real cryptocurrency)
- **Optional testnet faucet** — server-only private key, rate-limited endpoint for small testnet transfers
- **Responsive design** — glassmorphism UI, fullscreen video background, works on mobile to desktop
- **Footer** — © CryptX, made with love by Kupendra

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router), TypeScript |
| Styling | Tailwind CSS 4, PostCSS |
| Real-time | Socket.IO (standalone Express + Node server) |
| Crypto | Web Crypto API (AES-256-GCM), base64 |
| Wallet | ethers v6 (MetaMask browser provider) |

---

## Project Structure

```
cryptX/
├── app/
│   ├── layout.tsx                  # Root layout, global styles
│   ├── page.tsx                    # Main game UI, socket listeners, all actions
│   ├── learn/
│   │   └── page.tsx                # Learn how to decrypt — AES-GCM guide & tips
│   └── api/
│       ├── game/
│       │   ├── new-round/route.ts          # Start a new round
│       │   ├── new-encrypted-hint/route.ts # Re-encrypt a different hint
│       │   ├── reveal-hint/route.ts        # Show a readable hint via modal
│       │   ├── submit-guess/route.ts       # Check guess, score, rewards
│       │   └── give-up/route.ts            # Forfeit the round
│       └── reward/
│           └── claim/route.ts              # Optional testnet faucet endpoint
├── components/
│   ├── Leaderboard.tsx             # Ranked player table (position, points, ETH, USD)
│   ├── Modal.tsx                   # Animated popup overlay
│   ├── UsernamePrompt.tsx          # First-visit name entry prompt
│   └── Wallet.tsx                  # Wallet connect, balance, virtual rewards
├── lib/
│   ├── crypto.ts                   # AES-GCM encrypt / decrypt helpers
│   ├── emitter.ts                  # HTTP relay to socket server (/emit)
│   ├── socket-client.ts            # Client-side Socket.IO singleton
│   ├── state.ts                    # Per-session game state, constants, secrets list
│   ├── useSessionId.ts             # Client-only sessionId hook (localStorage)
│   └── uuid.ts                     # crypto.randomUUID with fallback
├── server/
│   └── socket.ts                   # Standalone Socket.IO + Express /emit relay
├── styles/
│   └── globals.css                 # Tailwind directives, custom button/card classes
├── public/
│   └── crypto.mp4                  # Fullscreen background video
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## How It Works

1. **Username prompt** — On first visit a fullscreen modal asks for your player name (stored in localStorage).
2. **Session** — A unique `sessionId` is generated client-side and the socket joins a room with that ID.
3. **New round** — `POST /api/game/new-round` picks a random cryptography term, encrypts a clue with AES-256-GCM, and starts a countdown timer.
4. **Real-time updates** — The server emits `tick` (timer), `state` (score/level/cipher), and `modal` (results/hints) events to the session room via the `/emit` relay.
5. **Player actions** — Submit a guess, request a hint, copy the cipher, start a new round, or give up.
6. **Scoring** — Correct answer: +100 points + (remaining seconds x 2) time bonus. Level increments each correct answer.
7. **Virtual ETH** — Every 100 points earns 1 virtual ETH. This is displayed on the leaderboard and wallet card.
8. **Leaderboard** — 10 players ranked by points with columns: Position, Player, Points, ETH Earned, USD Value.
9. **Wallet** — Optional MetaMask connect shows address, chain, balance, and USD estimate via CoinGecko API.

---

## Scoring System

| Action | Reward |
|--------|--------|
| Correct guess | +100 points |
| Time bonus | +2 x remaining seconds |
| Level up | +1 per correct answer |
| Virtual ETH | 100 points = 1 ETH (not real) |

---

## Cryptography Terms

The game includes 15 cryptography terms as possible secrets:

`blockchain`, `merkle tree`, `entropy`, `nonce`, `hash`, `zero knowledge`, `cipher`, `plaintext`, `salt`, `fernet`, `aes`, `iv`, `hmac`, `public key`, `private key`

Each term comes with a descriptive hint that can be revealed during gameplay.

---

## Environment Variables

Create `.env.local` at the project root. None are required for the base game.

**Optional faucet (testnet transfers):**

```env
FAUCET_PRIV_KEY=0x...
FAUCET_RPC_URL=https://...
FAUCET_CHAIN_ID=12345
FAUCET_AMOUNT_WEI=1000000000000000
FAUCET_MAX_PER_ADDRESS=1
FAUCET_RATE_PER_IP=3
FAUCET_EXPLORER_BASE=https://...
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the Socket.IO server (separate terminal)
npx tsx server/socket.ts

# 3. Start the Next.js dev server
npm run dev

# 4. Open http://localhost:3000
```

**Production:**

```bash
npm run build
npm run start
# + run server/socket.ts in a separate process
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npx tsx server/socket.ts` | Start Socket.IO relay server on port 3001 |

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Main game — encrypted clues, guessing, leaderboard, wallet |
| `/learn` | Learn how AES-GCM encryption works, tips for guessing, glossary of all terms |

---

## Troubleshooting

- **WebSocket timeout** — Ensure `server/socket.ts` is running on port 3001 and the client points to it.
- **422/400 on API** — POST bodies must include `{ sessionId }` (and `{ text }` for submit-guess).
- **Hydration errors** — All client-only logic (sessionId, localStorage) is wrapped in `useEffect` hooks.
- **No hints showing** — Confirm the reveal-hint route uses the emitter relay and emits a modal.

---

## License

MIT

---

Made with ❤️ by Kupendra
