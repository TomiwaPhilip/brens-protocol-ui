'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { unichainSepolia } from 'viem/chains';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'clzkuypw50029mm0fxcu6f9k4'}
            clientId='client-WY6ReAgoYimbHqoUhxNvtfENsmskNVjxrsXkSaLcG2euw'
            config={{
                appearance: {
                    theme: 'dark',
                    accentColor: '#10b981',
                },
                defaultChain: unichainSepolia,
                supportedChains: [unichainSepolia],
            }}
        >
            {children}
        </PrivyProvider>
    );
}
