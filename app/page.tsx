"use client";

import SwapCard from "@/components/SwapCard";
import { usePrivy } from "@privy-io/react-auth";

export default function Home() {
  const { login, logout, authenticated, ready } = usePrivy();
  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800">
      {/* Header */}
      <header className="w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                Brens Protocol
              </h1>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Zero-fee, zero-slippage swaps
              </p>
            </div>
          </div>
          {ready && (
            authenticated ? (
              <button
                onClick={logout}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={login}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
            <h2 className="text-4xl font-bold text-zinc-900 dark:text-white mb-3">
              Swap Pegged Assets
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Perfect 1:1 execution with circuit breaker protection
            </p>
          </div>

          <SwapCard />

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                Zero Slippage
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Constant sum pricing ensures perfect 1:1 rate for any trade size.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                Circuit Breaker
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Automatic protection prevents pool drainage during depeg events.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <p>Built on Uniswap v4 • Deployed on Unichain Sepolia</p>
        </div>
      </footer>
    </div>
  );
}
