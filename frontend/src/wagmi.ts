import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat, mainnet, sepolia } from 'wagmi/chains';
import { WC_PROJECT_ID } from '@/config/env.ts';

export const config = getDefaultConfig({
    appName: 'EDC Asset Agreement dApp',
    projectId: WC_PROJECT_ID,
    chains: [mainnet, sepolia, hardhat],
    ssr: false,
});
