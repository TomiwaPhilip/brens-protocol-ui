import { http, createConfig } from "wagmi";
import { unichainSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Configure chains & transports
export const config = createConfig({
  chains: [unichainSepolia],
  connectors: [
    injected(),
  ],
  transports: {
    [unichainSepolia.id]: http("https://sepolia.unichain.org"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
