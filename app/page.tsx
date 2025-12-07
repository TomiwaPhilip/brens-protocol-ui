"use client";

import SwapCard from "@/components/SwapCard";
import { usePrivy } from "@privy-io/react-auth";

export default function Home() {
  const { login, logout, authenticated, ready } = usePrivy();
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#0f172a" }}>
      {/* Header */}
      <header className="w-full border-b backdrop-blur-sm" style={{ borderColor: "#1e293b", backgroundColor: "rgba(15, 23, 42, 0.8)" }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#10b981" }}>
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "#f8fafc" }}>
                Brens Protocol
              </h1>
              <p className="text-xs" style={{ color: "#cbd5e1" }}>
                Zero-fee, zero-slippage swaps
              </p>
            </div>
          </div>
          {ready && (
            authenticated ? (
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: "#1e293b", color: "#f8fafc" }}
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={login}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: "#10b981", color: "#f8fafc" }}
              >
                Connect Wallet
              </button>
            )
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-3" style={{ color: "#f8fafc" }}>
              Swap Pegged Assets
            </h2>
            <p className="text-lg" style={{ color: "#cbd5e1" }}>
              Perfect 1:1 execution with circuit breaker protection
            </p>
          </div>

          <SwapCard />

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl shadow-lg" style={{ backgroundColor: "#1e293b" }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(16, 185, 129, 0.2)" }}>
                <svg className="w-6 h-6" style={{ color: "#10b981" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                Zero Fees
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No swap fees. Get exactly what you put in, 1:1 execution guaranteed.
              </p>
            </div>

            <div className="p-6 rounded-xl shadow-lg" style={{ backgroundColor: "#1e293b" }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(16, 185, 129, 0.2)" }}>
                <svg className="w-6 h-6" style={{ color: "#10b981" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "#f8fafc" }}>
                Zero Slippage
              </h3>
              <p className="text-sm" style={{ color: "#cbd5e1" }}>
                Constant sum pricing ensures perfect 1:1 rate for any trade size.
              </p>
            </div>

            <div className="p-6 rounded-xl shadow-lg" style={{ backgroundColor: "#1e293b" }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(16, 185, 129, 0.2)" }}>
                <svg className="w-6 h-6" style={{ color: "#10b981" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "#f8fafc" }}>
                Circuit Breaker
              </h3>
              <p className="text-sm" style={{ color: "#cbd5e1" }}>
                Automatic protection prevents pool drainage during depeg events.
              </p>
            </div>

            <div className="p-6 rounded-xl shadow-lg" style={{ backgroundColor: "#1e293b" }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(16, 185, 129, 0.2)" }}>
                <svg className="w-6 h-6" style={{ color: "#10b981" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: "#f8fafc" }}>
                Auto-Rebalancing
              </h3>
              <p className="text-sm" style={{ color: "#cbd5e1" }}>
                Keeper bots automatically rebalance pools to maintain optimal liquidity distribution.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t backdrop-blur-sm" style={{ borderColor: "#1e293b", backgroundColor: "rgba(15, 23, 42, 0.8)" }}>
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm" style={{ color: "#cbd5e1" }}>
          <p>Built on Uniswap v4 • Deployed on Unichain Sepolia</p>
        </div>
      </footer>
    </div>
  );
}
