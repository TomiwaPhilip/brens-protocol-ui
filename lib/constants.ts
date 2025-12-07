// Deployed contract addresses on Unichain Sepolia (Chain ID: 1301)
export const CONTRACTS = {
  HOOK: "0x6145f3Cba8c95A572548e3Cf47C8CEc729CC2888",
  TOKEN_A: "0x4eccff261b376277C521b25aEdC2446239e777Df",
  TOKEN_B: "0x70F648C883566493fbaaD3D329815eABbDE8AB31",
  ROUTER: "0x0ae5F4aFe70f0A9351D8c0fd017183722437eEdf",
  POOL_MANAGER: "0x00B036B58a818B1BC34d502D3fE730Db729e62AC",
  FAUCET: "0xE6aFe6a0243609620882C3169546761a9dFB2E2B",
} as const;

// Token metadata
export const TOKENS = {
  TOKEN_A: {
    address: CONTRACTS.TOKEN_A,
    name: "Token A",
    symbol: "TKA",
    decimals: 18,
  },
  TOKEN_B: {
    address: CONTRACTS.TOKEN_B,
    name: "Token B",
    symbol: "TKB",
    decimals: 18,
  },
} as const;

// ERC20 ABI (minimal for balance, approve, allowance)
export const ERC20_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// SimpleSwapRouter ABI
export const ROUTER_ABI = [
  {
    inputs: [
      {
        components: [
          { name: "currency0", type: "address" },
          { name: "currency1", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "tickSpacing", type: "int24" },
          { name: "hooks", type: "address" },
        ],
        name: "key",
        type: "tuple",
      },
      {
        components: [
          { name: "zeroForOne", type: "bool" },
          { name: "amountSpecified", type: "int256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
        name: "params",
        type: "tuple",
      },
    ],
    name: "swap",
    outputs: [
      {
        components: [
          { name: "amount0", type: "int128" },
          { name: "amount1", type: "int128" },
        ],
        name: "delta",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Pool key configuration
export const POOL_KEY = {
  currency0: CONTRACTS.TOKEN_A,
  currency1: CONTRACTS.TOKEN_B,
  fee: 3000,
  tickSpacing: 60,
  hooks: CONTRACTS.HOOK,
} as const;

// Uniswap v4 constants
export const MIN_SQRT_PRICE = BigInt("4295128739");
export const MAX_SQRT_PRICE = BigInt("1461446703485210103287273052203988822378723970342");

// Faucet ABI
export const FAUCET_ABI = [
  {
    inputs: [],
    name: "claimTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "hasClaimed",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "CLAIM_AMOUNT",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
