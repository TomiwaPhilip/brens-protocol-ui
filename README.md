# Brens Protocol UI

Zero-fee, zero-slippage swap interface for Brens Protocol on Unichain Sepolia.

## Features

- 🔐 Wallet connection via RainbowKit (MetaMask, WalletConnect, etc.)
- 💱 Token swapping with perfect 1:1 execution
- 📊 Real-time balance display
- ⚡ Automatic approval flow
- 🎨 Modern, responsive design
- 🌓 Dark mode support

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- MetaMask or another Web3 wallet

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing the Swap Flow

### 1. Connect Wallet

1. Click "Connect Wallet" in the top right
2. Select MetaMask (or your preferred wallet)
3. Approve the connection

### 2. Add Unichain Sepolia Network

Add the network to MetaMask:
- **Network Name**: Unichain Sepolia
- **RPC URL**: `https://sepolia.unichain.org`
- **Chain ID**: `1301`
- **Currency Symbol**: ETH
- **Block Explorer**: `https://unichain-sepolia.blockscout.com`

### 3. Get Test Tokens

You'll need test tokens to swap. You can get them by:

#### Option A: Request from Deployer
Contact the protocol deployer to send you some Token A and Token B.

#### Option B: Self-Service (if you have contract access)
```bash
# From brens-protocol directory
cast send <TOKEN_ADDRESS> "transfer(address,uint256)" <YOUR_ADDRESS> 1000000000000000000000 \
  --rpc-url https://sepolia.unichain.org \
  --private-key $PRIVATE_KEY
```

Token Addresses:
- **Token A**: `0x4eccff261b376277C521b25aEdC2446239e777Df`
- **Token B**: `0x70F648C883566493fbaaD3D329815eABbDE8AB31`

### 4. Perform a Swap

#### Token A → Token B
1. Enter amount in "From" field (e.g., "100")
2. Click "Approve TKA" (first time only)
3. Confirm approval transaction in MetaMask
4. Wait for confirmation
5. Click "Swap"
6. Confirm swap transaction in MetaMask
7. Wait for confirmation
8. Verify you received exactly 100 Token B (1:1, zero fees)

#### Token B → Token A
1. Click the switch button (↕) in the middle
2. Enter amount in "From" field
3. Follow same approval + swap flow
4. Verify 1:1 execution

### 5. Verify Zero Fees

After swapping:
- Check that input amount = output amount
- Verify "Rate: 1:1 (Zero fees)" is displayed
- Compare before/after balances (should differ by exact swap amount only)

## Contract Addresses

All contracts deployed on **Unichain Sepolia** (Chain ID: 1301)

- **ConstantSumHook**: `0x6145f3Cba8c95A572548e3Cf47C8CEc729CC2888`
- **Token A (TKA)**: `0x4eccff261b376277C521b25aEdC2446239e777Df`
- **Token B (TKB)**: `0x70F648C883566493fbaaD3D329815eABbDE8AB31`
- **SimpleSwapRouter**: `0x0ae5F4aFe70f0A9351D8c0fd017183722437eEdf`
- **Pool Manager**: `0x00B036B58a818B1BC34d502D3fE730Db729e62AC`

## Architecture

### Tech Stack

- **Next.js 16**: React framework with Turbopack
- **wagmi**: React hooks for Ethereum
- **viem**: TypeScript Ethereum library
- **RainbowKit**: Wallet connection UI
- **TanStack Query**: Data fetching and caching
- **Tailwind CSS**: Styling

### Key Components

- **`app/page.tsx`**: Main landing page with branding
- **`components/SwapCard.tsx`**: Core swap interface with approval and execution logic
- **`lib/wagmi.ts`**: Wagmi configuration for Unichain Sepolia
- **`lib/constants.ts`**: Contract addresses and ABIs
- **`app/providers.tsx`**: Wagmi and RainbowKit providers

## Troubleshooting

### "Insufficient funds" error
- Make sure you have test tokens in your wallet
- Ensure you're on Unichain Sepolia network
- Check you have ETH for gas fees

### Approval not working
- Verify you're approving to the correct router address
- Check MetaMask is on Unichain Sepolia
- Try refreshing the page and reconnecting wallet

### Swap transaction failing
- Ensure you have approved sufficient tokens
- Check the circuit breaker hasn't been triggered (70/30 limit)
- Verify pool has sufficient liquidity

### Balances not updating
- Wait a few seconds for blockchain confirmation
- Click "Refresh" in MetaMask
- Disconnect and reconnect wallet

## Gas Costs

Approximate gas usage on Unichain Sepolia:

| Operation | Gas Used | Cost (at 0.1 gwei) |
|-----------|----------|-------------------|
| Approve Token | ~45,000 | ~$0.000004 |
| Swap (exact input) | ~143,000 | ~$0.000014 |
| Add Liquidity | ~210,000 | ~$0.000021 |

## Security Notes

- **Testnet Only**: This deployment is for testing purposes only
- **No Real Value**: Test tokens have no monetary value
- **Audit Required**: Protocol should be audited before mainnet deployment
- **Smart Contract Risk**: Always verify contract addresses before interacting

## Links

- **Protocol Repository**: [brens-protocol](../brens-protocol)
- **Deployments**: See [DEPLOYMENTS.md](../brens-protocol/DEPLOYMENTS.md)
- **Pitch Deck**: See [PITCH.md](../brens-protocol/PITCH.md)
- **Unichain Sepolia Explorer**: https://unichain-sepolia.blockscout.com

---

**Built with ❤️ for DeFi**

*Last Updated: December 7, 2025*


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
