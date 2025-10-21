function requireEnv(name: string): string {
    const value = import.meta.env[name];
    if (value === undefined || value === '') {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function getEnv(name: string, defaultValue: string = ''): string {
    return import.meta.env[name] ?? defaultValue;
}

export const BACKEND_URL = requireEnv('VITE_BACKEND_URL');

export const WC_PROJECT_ID = requireEnv('VITE_WC_PROJECT_ID');
export const ETHERSCAN_API_KEY = getEnv('VITE_ETHERSCAN_API_KEY');
export const ALCHEMY_API_KEY = getEnv('VITE_ALCHEMY_API_KEY');

export const PINATA_API_KEY = getEnv('VITE_PINATA_API_KEY');
export const PINATA_SECRET = getEnv('VITE_PINATA_SECRET');
export const PINATA_JWT = getEnv('VITE_PINATA_JWT');

export const DEFAULT_BADGE_IMAGE = getEnv('VITE_DEFAULT_BADGE_IMAGE');

export const NFT_CONTRACT_ADDRESS_HARDHAT = getEnv('VITE_NFT_CONTRACT_ADDRESS_HARDHAT');
export const NFT_CONTRACT_ADDRESS_SEPOLIA = getEnv('VITE_NFT_CONTRACT_ADDRESS_SEPOLIA');
export const NFT_CONTRACT_ADDRESS_MAINNET = getEnv('VITE_NFT_CONTRACT_ADDRESS_MAINNET');
