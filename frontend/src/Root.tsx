import React from 'react';
import App from './App.tsx';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { darkTheme, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { config } from './wagmi.ts';
import { useTheme } from 'next-themes';

const queryClient = new QueryClient();

const Root = (): React.ReactElement => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider showRecentTransactions={true} theme={isDarkMode ? darkTheme() : lightTheme()}>
                    <App />
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};

export default Root;