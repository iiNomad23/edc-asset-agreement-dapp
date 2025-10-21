import React from 'react';
import App from './App.tsx';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { darkTheme, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { config } from './wagmi.ts';

const queryClient = new QueryClient();

const Root = (): React.ReactElement => {
    const [isDarkMode, setIsDarkMode] = React.useState(
        window.matchMedia('(prefers-color-scheme: dark)').matches,
    );

    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (event: MediaQueryListEvent) => {
            setIsDarkMode(event.matches);
        };

        mediaQuery.addEventListener('change', handler);
        return () => {
            mediaQuery.removeEventListener('change', handler);
        };
    }, []);

    React.useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
    }, [isDarkMode]);

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