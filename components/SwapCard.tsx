"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther, Address } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  CONTRACTS,
  TOKENS,
  ERC20_ABI,
  ROUTER_ABI,
  POOL_KEY,
  MIN_SQRT_PRICE,
  MAX_SQRT_PRICE,
} from "@/lib/constants";

export default function SwapCard() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [isTokenAToB, setIsTokenAToB] = useState(true);

  const inputToken = isTokenAToB ? TOKENS.TOKEN_A : TOKENS.TOKEN_B;
  const outputToken = isTokenAToB ? TOKENS.TOKEN_B : TOKENS.TOKEN_A;

  // Read token balances
  const { data: inputBalance, refetch: refetchInputBalance } = useReadContract({
    address: inputToken.address as Address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: outputBalance, refetch: refetchOutputBalance } = useReadContract({
    address: outputToken.address as Address,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: inputToken.address as Address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.ROUTER] : undefined,
    query: { enabled: !!address },
  });

  // Write contracts
  const {
    writeContract: approve,
    data: approveHash,
    isPending: isApproving,
  } = useWriteContract();

  const {
    writeContract: swap,
    data: swapHash,
    isPending: isSwapping,
  } = useWriteContract();

  // Wait for transactions
  const { isLoading: isApproveTxLoading } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isSwapTxLoading } = useWaitForTransactionReceipt({
    hash: swapHash,
  });

  const needsApproval = () => {
    if (!amount || !allowance) return false;
    try {
      const amountBigInt = parseEther(amount);
      return (allowance as bigint) < amountBigInt;
    } catch {
      return false;
    }
  };

  const handleApprove = async () => {
    try {
      approve({
        address: inputToken.address as Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [CONTRACTS.ROUTER, parseEther(amount)],
      });
    } catch (error) {
      console.error("Approval error:", error);
    }
  };

  const handleSwap = async () => {
    if (!amount) return;

    try {
      const amountBigInt = parseEther(amount);
      
      swap({
        address: CONTRACTS.ROUTER as Address,
        abi: ROUTER_ABI,
        functionName: "swap",
        args: [
          POOL_KEY,
          {
            zeroForOne: isTokenAToB,
            amountSpecified: -BigInt(amountBigInt.toString()), // Negative for exact input
            sqrtPriceLimitX96: isTokenAToB ? MIN_SQRT_PRICE + 1n : MAX_SQRT_PRICE - 1n,
          },
        ],
      });
    } catch (error) {
      console.error("Swap error:", error);
    }
  };

  const handleMaxClick = () => {
    if (inputBalance) {
      setAmount(formatEther(inputBalance as bigint));
    }
  };

  const handleSwitchTokens = () => {
    setIsTokenAToB(!isTokenAToB);
    setAmount("");
  };

  // Refetch balances after successful transactions
  if (approveHash && !isApproveTxLoading) {
    refetchAllowance();
  }

  if (swapHash && !isSwapTxLoading) {
    refetchInputBalance();
    refetchOutputBalance();
    setAmount("");
  }

  const isLoading = isApproving || isApproveTxLoading || isSwapping || isSwapTxLoading;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Swap</h2>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Unichain Sepolia
        </div>
      </div>

      {/* Connect Wallet */}
      {!isConnected ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <p className="text-zinc-600 dark:text-zinc-400">Connect your wallet to start swapping</p>
          <ConnectButton />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Input Token */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">From</span>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Balance: {inputBalance ? formatEther(inputBalance as bigint).slice(0, 8) : "0.00"}
                <button
                  onClick={handleMaxClick}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  MAX
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 text-2xl font-medium bg-transparent outline-none text-zinc-900 dark:text-white"
              />
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-700 rounded-lg">
                <span className="font-medium text-zinc-900 dark:text-white">
                  {inputToken.symbol}
                </span>
              </div>
            </div>
          </div>

          {/* Switch Button */}
          <div className="flex justify-center -my-2">
            <button
              onClick={handleSwitchTokens}
              aria-label="Switch tokens"
              className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <svg
                className="w-6 h-6 text-zinc-600 dark:text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </button>
          </div>

          {/* Output Token */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">To</span>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Balance: {outputBalance ? formatEther(outputBalance as bigint).slice(0, 8) : "0.00"}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="0.0"
                value={amount}
                readOnly
                className="flex-1 text-2xl font-medium bg-transparent outline-none text-zinc-900 dark:text-white"
              />
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-700 rounded-lg">
                <span className="font-medium text-zinc-900 dark:text-white">
                  {outputToken.symbol}
                </span>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          {amount && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-900 dark:text-blue-300">Rate</span>
                <span className="font-medium text-blue-900 dark:text-blue-300">1:1 (Zero fees)</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          {needsApproval() ? (
            <button
              onClick={handleApprove}
              disabled={isLoading || !amount}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
            >
              {isApproving || isApproveTxLoading
                ? "Approving..."
                : `Approve ${inputToken.symbol}`}
            </button>
          ) : (
            <button
              onClick={handleSwap}
              disabled={isLoading || !amount || parseFloat(amount) === 0}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
            >
              {isSwapping || isSwapTxLoading ? "Swapping..." : "Swap"}
            </button>
          )}

          {/* Transaction Status */}
          {(approveHash || swapHash) && (
            <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              {isApproveTxLoading && "Waiting for approval confirmation..."}
              {isSwapTxLoading && "Waiting for swap confirmation..."}
              {approveHash && !isApproveTxLoading && "Approval confirmed!"}
              {swapHash && !isSwapTxLoading && "Swap successful!"}
            </div>
          )}
        </div>
      )}

      {/* Protocol Info */}
      <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Powered by Brens Protocol</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Zero Slippage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
