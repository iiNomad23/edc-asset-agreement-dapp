import { hardhat, mainnet, sepolia } from 'wagmi/chains';
import {
    NFT_CONTRACT_ADDRESS_HARDHAT,
    NFT_CONTRACT_ADDRESS_MAINNET,
    NFT_CONTRACT_ADDRESS_SEPOLIA,
} from '@/config/env.ts';
import { Address } from 'viem';

export const DEFAULT_BADGE_IMAGE = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=400&fit=crop';

export const MAX_GAS_LIMIT = 2_000_000n;
export const GAS_BUFFER_MULTIPLIER = 120n;

export const CONTRACT_ADDRESSES: Record<number, Address> = {
    [mainnet.id]: NFT_CONTRACT_ADDRESS_MAINNET as Address,
    [sepolia.id]: NFT_CONTRACT_ADDRESS_SEPOLIA as Address,
    [hardhat.id]: NFT_CONTRACT_ADDRESS_HARDHAT as Address,
};

export const ETHERSCAN_BASES: Record<number, string> = {
    [mainnet.id]: 'https://etherscan.io',
    [sepolia.id]: 'https://sepolia.etherscan.io',
    [hardhat.id]: '',
};