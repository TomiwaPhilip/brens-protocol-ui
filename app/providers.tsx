"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { UNICHAIN_SEPOLIA } from "@/lib/wagmi";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || "clzkuypw50029mm0fxcu6f9k4"}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#2563eb",
          logo: undefined,
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        defaultChain: UNICHAIN_SEPOLIA,
        supportedChains: [UNICHAIN_SEPOLIA],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
