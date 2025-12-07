"use client";

import { useState, useEffect } from "react";
import { createWalletClient, custom, createPublicClient, http, formatEther, parseEther, type Address } from "viem";
import { unichainSepolia } from "viem/chains";
import toast, { Toaster } from "react-hot-toast";
import {
  CONTRACTS,
  TOKENS,
  ERC20_ABI,
  ROUTER_ABI,
  FAUCET_ABI,
  POOL_KEY,
  MIN_SQRT_PRICE,
  MAX_SQRT_PRICE,
} from "@/lib/constants";

export default function SwapCard() {
  const [account, setAccount] = useState<Address | null>(null);
  const [amount, setAmount] = useState("");
  const [isTokenAToB, setIsTokenAToB] = useState(true);
  const [balances, setBalances] = useState({ input: "0", output: "0" });
  const [allowance, setAllowance] = useState("0");
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [txStatus, setTxStatus] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);

  const inputToken = isTokenAToB ? TOKENS.TOKEN_A : TOKENS.TOKEN_B;
  const outputToken = isTokenAToB ? TOKENS.TOKEN_B : TOKENS.TOKEN_A;

  const publicClient = createPublicClient({
    chain: unichainSepolia,
    transport: http(),
  });

  useEffect(() => {
    if (account) {
      fetchBalances();
      fetchAllowance();
      checkHasClaimed();
    }
  }, [account, isTokenAToB]);

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error("Please install MetaMask!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      // Switch to Unichain Sepolia
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x515" }], // 1301 in hex
        });
      } catch (switchError: any) {
        // Chain not added, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0x515",
              chainName: "Unichain Sepolia",
              nativeCurrency: {
                name: "Ether",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://sepolia.unichain.org"],
              blockExplorerUrls: ["https://unichain-sepolia.blockscout.com"],
            }],
          });
        }
      }

      setAccount(accounts[0] as Address);
      toast.success("Wallet connected!");
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect wallet");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    toast.success("Wallet disconnected");
  };

  const getWalletClient = () => {
    if (!window.ethereum) throw new Error("No ethereum provider");
    return createWalletClient({
      chain: unichainSepolia,
      transport: custom(window.ethereum),
    });
  };

  const fetchBalances = async () => {
    if (!account) return;
    try {
      const [inputBal, outputBal] = await Promise.all([
        publicClient.readContract({
          address: inputToken.address as Address,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [account],
        }),
        publicClient.readContract({
          address: outputToken.address as Address,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [account],
        }),
      ]);

      setBalances({
        input: formatEther(inputBal as bigint),
        output: formatEther(outputBal as bigint),
      });
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  const fetchAllowance = async () => {
    if (!account || !amount) return;
    try {
      const allow = await publicClient.readContract({
        address: inputToken.address as Address,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [account, CONTRACTS.ROUTER as Address],
      });
      setAllowance(formatEther(allow as bigint));
    } catch (error) {
      console.error("Error fetching allowance:", error);
    }
  };

  const checkHasClaimed = async () => {
    if (!account) return;
    try {
      const claimed = await publicClient.readContract({
        address: CONTRACTS.FAUCET as Address,
        abi: FAUCET_ABI,
        functionName: "hasClaimed",
        args: [account],
      });
      setHasClaimed(claimed as boolean);
    } catch (error) {
      console.error("Error checking claim status:", error);
    }
  };

  const needsApproval = () => {
    if (!amount || parseFloat(amount) === 0) return false;
    try {
      return parseFloat(allowance) < parseFloat(amount);
    } catch {
      return false;
    }
  };

  const handleApprove = async () => {
    if (!account || !amount) return;
    setIsApproving(true);
    setTxStatus("Approving...");

    try {
      const walletClient = getWalletClient();
      const amountWei = parseEther(amount);
      
      const hash = await walletClient.writeContract({
        account,
        address: inputToken.address as Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [CONTRACTS.ROUTER, amountWei],
      });
      
      setTxStatus("Waiting for approval confirmation...");
      await publicClient.waitForTransactionReceipt({ hash });
      
      setTxStatus("Approval confirmed!");
      await fetchAllowance();
      setTimeout(() => setTxStatus(""), 3000);
    } catch (error: any) {
      console.error("Approval error:", error);
      setTxStatus("Approval failed: " + (error.message || "Unknown error"));
      setTimeout(() => setTxStatus(""), 5000);
    } finally {
      setIsApproving(false);
    }
  };

  const handleSwap = async () => {
    if (!account || !amount) return;
    setIsSwapping(true);
    setTxHash(null);
    setTxStatus("Swapping...");

    try {
      const walletClient = getWalletClient();
      const amountWei = parseEther(amount);
      const sqrtPriceLimit = isTokenAToB 
        ? BigInt(MIN_SQRT_PRICE) + 1n 
        : BigInt(MAX_SQRT_PRICE) - 1n;

      const hash = await walletClient.writeContract({
        account,
        address: CONTRACTS.ROUTER as Address,
        abi: ROUTER_ABI,
        functionName: "swap",
        args: [
          POOL_KEY,
          {
            zeroForOne: isTokenAToB,
            amountSpecified: -amountWei,
            sqrtPriceLimitX96: sqrtPriceLimit,
          },
        ],
      });

      setTxStatus("Waiting for swap confirmation...");
      await publicClient.waitForTransactionReceipt({ hash });

      setTxHash(hash);
      setTxStatus("Swap successful!");
      await fetchBalances();
      setAmount("");
    } catch (error: any) {
      console.error("Swap error:", error);
      setTxStatus("Swap failed: " + (error.message || "Unknown error"));
      setTimeout(() => setTxStatus(""), 5000);
    } finally {
      setIsSwapping(false);
    }
  };

  const handleMaxClick = () => {
    setAmount(balances.input);
  };

  const handleSwitchTokens = () => {
    setIsTokenAToB(!isTokenAToB);
    setAmount("");
  };

  const handleClaimTokens = async () => {
    if (!account) return;
    setIsClaiming(true);

    try {
      const walletClient = getWalletClient();
      toast.loading("Claiming test tokens...", { id: "claim" });

      const hash = await walletClient.writeContract({
        account,
        address: CONTRACTS.FAUCET as Address,
        abi: FAUCET_ABI,
        functionName: "claimTokens",
      });

      await publicClient.waitForTransactionReceipt({ hash });

      setHasClaimed(true);
      await fetchBalances();

      toast.success(
        <div>
          <div className="font-semibold">Tokens claimed successfully!</div>
          <div className="text-sm mt-1">Received: 1,000 {TOKENS.TOKEN_A.symbol} + 1,000 {TOKENS.TOKEN_B.symbol}</div>
        </div>,
        { id: "claim", duration: 5000 }
      );
    } catch (error: any) {
      console.error("Claim error:", error);
      if (error.message?.includes("AlreadyClaimed")) {
        toast.error("You have already claimed tokens!", { id: "claim" });
      } else if (error.message?.includes("InsufficientBalance")) {
        toast.error("Faucet is empty. Please contact support.", { id: "claim" });
      } else {
        toast.error("Failed to claim tokens: " + (error.shortMessage || error.message || "Unknown error"), { id: "claim" });
      }
    } finally {
      setIsClaiming(false);
    }
  };

  const isConnected = !!account;
  const isLoading = isApproving || isSwapping;

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-2xl shadow-xl" style={{ backgroundColor: "#1e293b" }}>
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#f8fafc" }}>Swap</h2>
          <div className="text-xs" style={{ color: "#cbd5e1" }}>
            Unichain Sepolia
          </div>
        </div>
        {isConnected && (
          <button
            onClick={handleClaimTokens}
            disabled={isClaiming || hasClaimed}
            className="px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: hasClaimed ? "#334155" : "#10b981", color: "#f8fafc" }}
          >
            {isClaiming ? "Claiming..." : hasClaimed ? "Claimed" : "Get Test Tokens"}
          </button>
        )}
      </div>

      {/* Connect Wallet */}
      {!isConnected ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <p style={{ color: "#cbd5e1" }}>Connect your wallet to start swapping</p>
          <button
            onClick={connectWallet}
            className="px-6 py-3 font-medium rounded-xl transition-colors"
            style={{ backgroundColor: "#10b981", color: "#f8fafc" }}
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Connected Address */}
          <div className="flex items-center justify-between text-sm mb-4">
            <span style={{ color: "#cbd5e1" }}>Connected:</span>
            <div className="flex items-center gap-2">
              <span style={{ color: "#10b981" }}>{account.slice(0, 6)}...{account.slice(-4)}</span>
              <button
                onClick={disconnectWallet}
                className="text-xs px-2 py-1 rounded"
                style={{ backgroundColor: "#334155", color: "#cbd5e1" }}
              >
                Disconnect
              </button>
            </div>
          </div>

          {/* Input Token */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: "#cbd5e1" }}>From</span>
              <div className="text-sm" style={{ color: "#cbd5e1" }}>
                Balance: {parseFloat(balances.input).toFixed(4)}
                <button
                  onClick={handleMaxClick}
                  className="ml-2 hover:underline"
                  style={{ color: "#10b981" }}
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
              className="p-2 rounded-full transition-colors"
              style={{ backgroundColor: "#1e293b" }}
            >
              <svg
                className="w-6 h-6"
                style={{ color: "#10b981" }}
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
                Balance: {parseFloat(balances.output).toFixed(4)}
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
            <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "#10b981" }}>Rate</span>
                <span className="font-medium" style={{ color: "#10b981" }}>1:1 (Zero fees)</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          {needsApproval() ? (
            <button
              onClick={handleApprove}
              disabled={isLoading || !amount}
              className="w-full py-4 disabled:cursor-not-allowed font-medium rounded-xl transition-colors"
              style={{ backgroundColor: (isLoading || !amount) ? "#334155" : "#10b981", color: "#f8fafc" }}
            >
              {isApproving ? "Approving..." : `Approve ${inputToken.symbol}`}
            </button>
          ) : (
            <button
              onClick={handleSwap}
              disabled={isLoading || !amount || parseFloat(amount) === 0}
              className="w-full py-4 disabled:cursor-not-allowed font-medium rounded-xl transition-colors"
              style={{ backgroundColor: (isLoading || !amount || parseFloat(amount) === 0) ? "#334155" : "#10b981", color: "#f8fafc" }}
            >
              {isSwapping ? "Swapping..." : "Swap"}
            </button>
          )}

          {/* Transaction Status */}
          {txStatus && (
            <div className="text-center text-sm space-y-2">
              <div style={{ color: "#cbd5e1" }}>
                {txStatus}
              </div>
              {txHash && (
                <a
                  href={`https://unichain-sepolia.blockscout.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors"
                  style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}
                >
                  View on Blockscout
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Protocol Info */}
      <div className="mt-6 pt-6 border-t" style={{ borderColor: "#334155" }}>
        <div className="flex items-center justify-between text-xs" style={{ color: "#cbd5e1" }}>
          <span>Powered by Brens Protocol</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#10b981" }}></span>
            <span>Zero Slippage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
