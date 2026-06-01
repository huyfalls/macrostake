"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, polygon, base } from "wagmi/chains";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { useState } from "react";

const wagmiConfig = getDefaultConfig({
  appName:   "MacroStake",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo",
  chains:    [mainnet, polygon, base],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [base.id]:    http(),
  },
  ssr: true,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }));

  return (
    <WagmiProvider config={wagmiConfig}>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: { background: "#18181b", color: "#fff", border: "1px solid #27272a" },
              }}
            />
          </RainbowKitProvider>
        </QueryClientProvider>
      </SessionProvider>
    </WagmiProvider>
  );
}
