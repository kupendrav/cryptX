"use client";
import Link from "next/link";

export default function LearnPage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background video */}
      <video
        className="fixed inset-0 h-full w-full object-cover brightness-[0.9] saturate-[1.05] -z-10"
        src="/crypto.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4">
        <Link
          href="/"
          className="rounded-xl bg-white text-black font-semibold text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3 hover:bg-white/90 active:scale-[0.98] transition no-underline"
        >
          ← Back to Game
        </Link>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow m-0">
          Learn Decryption
        </h1>
        <div className="w-[120px] sm:w-[160px]" />
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-8 pb-20">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 mt-4 sm:mt-6">
          {/* Intro */}
          <section className="card-glass rounded-2xl p-4 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-300 mb-3 sm:mb-4">What is AES-GCM Encryption?</h2>
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed">
              AES-GCM (Advanced Encryption Standard – Galois/Counter Mode) is one of the most widely used
              symmetric encryption algorithms. It provides both <strong className="text-white">confidentiality</strong> (nobody
              can read the data) and <strong className="text-white">integrity</strong> (nobody can tamper with it
              undetected). In CryptX, every clue you see is encrypted with AES-256-GCM using a random key and
              initialization vector (IV).
            </p>
          </section>

          {/* How encryption works */}
          <section className="card-glass rounded-2xl p-4 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-300 mb-3 sm:mb-4">How the Encrypted Clue is Created</h2>
            <ol className="text-slate-200 text-base sm:text-lg space-y-2 sm:space-y-3 list-decimal list-inside">
              <li>
                <strong className="text-white">Key Generation:</strong> A 256-bit random key is generated using the Web Crypto API.
              </li>
              <li>
                <strong className="text-white">IV (Initialization Vector):</strong> A 12-byte random IV ensures the same
                plaintext never produces the same ciphertext.
              </li>
              <li>
                <strong className="text-white">Encryption:</strong> The plaintext clue (a crypto term or hint) is passed through
                AES-GCM with the key and IV, producing ciphertext + an authentication tag.
              </li>
              <li>
                <strong className="text-white">Base64 Encoding:</strong> The IV + ciphertext + tag are concatenated and encoded to
                base64 — that&#39;s the long string you see on screen.
              </li>
            </ol>
          </section>

          {/* Reading the ciphertext */}
          <section className="card-glass rounded-2xl p-4 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-300 mb-3 sm:mb-4">Reading the Ciphertext</h2>
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed mb-3">
              The base64 string in the yellow box has this structure:
            </p>
            <div className="bg-black/50 rounded-xl p-3 sm:p-4 font-mono text-sm sm:text-base text-green-300 break-all">
              [12 bytes IV] + [ciphertext] + [16 bytes auth tag] → base64
            </div>
            <p className="text-slate-300 text-sm sm:text-base mt-3">
              Without the key, you <em>cannot</em> decrypt it — that&#39;s the whole point! Use hints and your
              cryptography knowledge to figure out the answer.
            </p>
          </section>

          {/* Tips */}
          <section className="card-glass rounded-2xl p-4 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-300 mb-3 sm:mb-4">Tips for Guessing</h2>
            <ul className="text-slate-200 text-base sm:text-lg space-y-2 sm:space-y-3 list-disc list-inside">
              <li>
                <strong className="text-white">Use hints wisely:</strong> Each hint reveals a readable clue about the
                secret term. You have limited hints per round.
              </li>
              <li>
                <strong className="text-white">Think cryptography:</strong> All answers are cryptography terms — think
                about algorithms, protocols, key types, and security concepts.
              </li>
              <li>
                <strong className="text-white">Base64 length:</strong> The cipher length can give a rough idea of the
                plaintext length, but AES-GCM adds overhead (IV + tag).
              </li>
              <li>
                <strong className="text-white">Speed matters:</strong> You earn a time bonus for faster answers, so
                don&apos;t overthink — guess early if you have an idea!
              </li>
              <li>
                <strong className="text-white">New encrypted hints:</strong> Clicking &quot;New Hint&quot; re-encrypts a different
                piece of info with a fresh key, giving you a new ciphertext to examine.
              </li>
            </ul>
          </section>

          {/* Common crypto terms */}
          <section className="card-glass rounded-2xl p-4 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-300 mb-3 sm:mb-4">Common Cryptography Terms</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm sm:text-base">
              {[
                ["AES", "Symmetric block cipher, NIST standard"],
                ["RSA", "Asymmetric algorithm for encryption & signing"],
                ["Hash", "One-way function producing fixed output"],
                ["HMAC", "Keyed-hash message authentication code"],
                ["Nonce", "Number used once to prevent replay attacks"],
                ["Salt", "Random data to defeat rainbow tables"],
                ["IV", "Initialization vector for block cipher modes"],
                ["Entropy", "Measure of randomness for key generation"],
                ["Public Key", "Shared key for asymmetric encryption"],
                ["Private Key", "Secret key for decryption/signing"],
                ["Merkle Tree", "Hash tree for efficient data verification"],
                ["Zero Knowledge", "Prove truth without revealing data"],
                ["Blockchain", "Distributed, immutable ledger"],
                ["Cipher", "Algorithm for encryption/decryption"],
                ["Fernet", "Symmetric scheme using AES + HMAC"],
              ].map(([term, desc]) => (
                <div key={term} className="flex gap-2 text-slate-200">
                  <span className="text-yellow-300 font-semibold min-w-[110px] sm:min-w-[130px]">{term}:</span>
                  <span className="text-slate-300">{desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Scoring */}
          <section className="card-glass rounded-2xl p-4 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-300 mb-3 sm:mb-4">Scoring System</h2>
            <ul className="text-slate-200 text-base sm:text-lg space-y-2 list-disc list-inside">
              <li><strong className="text-white">+100 points</strong> for a correct guess</li>
              <li><strong className="text-white">+2 × remaining seconds</strong> as time bonus</li>
              <li><strong className="text-white">Level up</strong> each correct answer</li>
              <li><strong className="text-white">100 points = 1 virtual ETH</strong> (for fun only, not real cryptocurrency)</li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-4 text-slate-400 text-xs sm:text-sm">
        © {new Date().getFullYear()} CryptX. Made with ❤️ by Kupendra. All rights reserved.
      </footer>
    </div>
  );
}
