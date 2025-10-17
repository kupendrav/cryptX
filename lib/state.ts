export type RoundState = {
  key: CryptoKey | null;
  secret: string;
  hint: string;
  cipher: string; // base64 of encrypted clue (secret or hint)
  attempts: number;
  hints: number;
  timeLeft: number;
  score: number;
  level: number;
  running: boolean;
  timer?: NodeJS.Timeout | null;
  rewardsEth: number; // virtual ETH earned from points/levels
  
};

export const ROUND_TIME = 45;
export const ATTEMPTS = 4;
export const HINTS = 2;
export const SCORE_CORRECT = 100;
export const SCORE_TIME_BONUS = 2;

export const SECRETS: Array<[string, string]> = [
  ["blockchain", "It is a distributed ledger technology often used for cryptocurrencies."],
  ["merkle tree", "A hash-based tree used to verify data efficiently in blocks."],
  ["entropy", "Randomness used for generating cryptographic keys."],
  ["nonce", "A number used once to ensure uniqueness in cryptographic protocols."],
  ["hash", "A one-way function producing fixed-size output from arbitrary input."],
  ["zero knowledge", "A proof method to show truth without revealing the information."],
  ["cipher", "An algorithm for performing encryption or decryption."],
  ["plaintext", "The unencrypted original message."],
  ["salt", "Random data added to inputs to prevent rainbow table attacks."],
  ["fernet", "A symmetric encryption scheme built on AES and HMAC, URL-safe tokens."],
  ["aes", "A widely used symmetric-key algorithm standardized by NIST."],
  ["iv", "Initialization value used to kickstart block cipher modes."],
  ["hmac", "A keyed-hash for message authentication."],
  ["public key", "Shared key enabling others to encrypt messages for a recipient."],
  ["private key", "A secret key used to decrypt or sign in asymmetric cryptography."],
];

export const sessions = new Map<string, RoundState>();
