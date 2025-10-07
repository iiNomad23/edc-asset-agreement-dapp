import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat, mainnet, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'EDC Asset Agreement dApp',
    projectId: import.meta.env.VITE_WC_PROJECT_ID,
    chains: [mainnet, sepolia, hardhat],
    ssr: false,
});
