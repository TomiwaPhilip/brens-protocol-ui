"use client";

import { useState, useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
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
  const { login, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const [amount, setAmount] = useState("");
  const [isTokenAToB, setIsTokenAToB] = useState(true);
  const [balances, setBalances] = useState({ input: "0", output: "0" });
  const [allowance, setAllowance] = useState("0");
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [txStatus, setTxStatus] = useState("");
  const [address, setAddress] = useState<string>("");

  const inputToken = isTokenAToB ? TOKENS.TOKEN_A : TOKENS.TOKEN_B;
  const outputToken = isTokenAToB ? TOKENS.TOKEN_B : TOKENS.TOKEN_A;

  // Get wallet and provider
  const wallet = wallets[0];

  useEffect(() => {
    if (wallet) {
      setAddress(wallet.address);
      fetchBalances();
      fetchAllowance();
    }
  }, [wallet, isTokenAToB]);

  const getProvider = async () => {
    if (!wallet) throw new Error("No wallet connected");
    await wallet.switchChain(1301); // Unichain Sepolia
    const provider = await wallet.getEthersProvider();
    return new ethers.BrowserProvider(provider);
  };

  const fetchBalances = async () => {
    if (!wallet) return;
    try {
      const provider = await getProvider();
      const inputContract = new ethers.Contract(inputToken.address, ERC20_ABI, provider);
      const outputContract = new ethers.Contract(outputToken.address, ERC20_ABI, provider);

      const [inputBal, outputBal] = await Promise.all([
        inputContract.balanceOf(wallet.address),
        outputContract.balanceOf(wallet.address),
      ]);

      setBalances({
        input: ethers.formatEther(inputBal),
        output: ethers.formatEther(outputBal),
      });
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  const fetchAllowance = async () => {
    if (!wallet || !amount) return;
    try {
      const provider = await getProvider();
      const contract = new ethers.Contract(inputToken.address, ERC20_ABI, provider);
      const allow = await contract.allowance(wallet.address, CONTRACTS.ROUTER);
      setAllowance(ethers.formatEther(allow));
    } catch (error) {
      console.error("Error fetching allowance:", error);
    }
  };

  const needsApproval = () => {
    if (!amount || !allowance) return false;
    try {
      return parseFloat(allowance) < parseFloat(amount);
    } catch {
      return false;
    }
  };

  const handleApprove = async () => {
    if (!wallet || !amount) return;
    setIsApproving(true);
    setTxStatus("Approving...");

    try {
      const provider = await getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(inputToken.address, ERC20_ABI, signer);
      
      const amountWei = ethers.parseEther(amount);
      const tx = await contract.approve(CONTRACTS.ROUTER, amountWei);
      
      setTxStatus("Waiting for approval confirmation...");
      await tx.wait();
      
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
    if (!wallet || !amount) return;
    setIsSwapping(true);
    setTxStatus("Swapping...");

    try {
      const provider = await getProvider();
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACTS.ROUTER, ROUTER_ABI, signer);

      const amountWei = ethers.parseEther(amount);
      const sqrtPriceLimit = isTokenAToB 
        ? BigInt(MIN_SQRT_PRICE) + 1n 
        : BigInt(MAX_SQRT_PRICE) - 1n;

      const tx = await contract.swap(
        POOL_KEY,
        {
          zeroForOne: isTokenAToB,
          amountSpecified: -amountWei, // Negative for exact input
          sqrtPriceLimitX96: sqrtPriceLimit,
        }
      );

      setTxStatus("Waiting for swap confirmation...");
      await tx.wait();

      setTxStatus("Swap successful!");
      await fetchBalances();
      setAmount("");
      setTimeout(() => setTxStatus(""), 3000);
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

  const isConnected = authenticated && wallet;
  const isLoading = isApproving || isSwapping;

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
          <button
            onClick={login}
            disabled={!ready}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Input Token */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">From</span>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Balance: {parseFloat(balances.input).toFixed(4)}
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
              {isApproving ? "Approving..." : `Approve ${inputToken.symbol}`}
            </button>
          ) : (
            <button
              onClick={handleSwap}
              disabled={isLoading || !amount || parseFloat(amount) === 0}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
            >
              {isSwapping ? "Swapping..." : "Swap"}
            </button>
          )}

          {/* Transaction Status */}
          {txStatus && (
            <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
              {txStatus}
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
