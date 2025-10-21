import { useChainId, usePublicClient, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { Address } from 'viem';
import { EDC_AGREEMENT_NFT_ABI } from '@/constants/contractAgreementNFTabi.ts';
import { hardhat, mainnet, sepolia } from 'wagmi/chains';
import { useEffect, useState } from 'react';
import {
    NFT_CONTRACT_ADDRESS_HARDHAT,
    NFT_CONTRACT_ADDRESS_MAINNET,
    NFT_CONTRACT_ADDRESS_SEPOLIA,
} from '@/config/env.ts';

const CONTRACT_ADDRESSES: Record<number, Address> = {
    [mainnet.id]: NFT_CONTRACT_ADDRESS_MAINNET as Address,
    [sepolia.id]: NFT_CONTRACT_ADDRESS_SEPOLIA as Address,
    [hardhat.id]: NFT_CONTRACT_ADDRESS_HARDHAT as Address,
};

export function useContractAddress(): Address {
    const chainId = useChainId();
    return CONTRACT_ADDRESSES[chainId];
}

export interface MintAgreementParams {
    recipient: Address;
    agreementId: string;
    assetId: string;
    providerId: string;
    consumerId: string;
    signedAt: bigint;
    expiresAt: bigint;
    tokenURI: string;
}

export interface AgreementMetadata {
    agreementId: string;
    assetId: string;
    signedAt: bigint;
    providerId: string;
    consumerId: string;
    expiresAt: bigint;
    isRevoked: boolean;
    revokedAt: bigint;
    revokeReason: string;
}

export function useEDCAgreementNFT() {
    const contractAddress = useContractAddress();

    const {
        writeContractAsync,
        data: hash,
        isPending: isWritePending,
    } = useWriteContract();

    const { isLoading: isTxConfirming } = useWaitForTransactionReceipt({ hash });

    const mintAgreement = (params: MintAgreementParams) => {
        return writeContractAsync({
            address: contractAddress,
            abi: EDC_AGREEMENT_NFT_ABI,
            functionName: 'mintAgreement',
            args: [
                params.recipient,
                params.agreementId,
                params.assetId,
                params.providerId,
                params.consumerId,
                params.signedAt,
                params.expiresAt,
                params.tokenURI,
            ],
            gas: 2_000_000n,
        });
    };

    const revokeAgreement = (tokenId: bigint, reason: string) => {
        return writeContractAsync({
            address: contractAddress,
            abi: EDC_AGREEMENT_NFT_ABI,
            functionName: 'revokeAgreement',
            args: [tokenId, reason],
        });
    };

    return {
        mintAgreement,
        revokeAgreement,
        isWritePending,
        isTxConfirming,
        hash,
    };
}

export function useAgreementTokens(address?: Address) {
    const contractAddress = useContractAddress();
    const { data, isLoading } = useReadContract({
        address: contractAddress,
        abi: EDC_AGREEMENT_NFT_ABI,
        functionName: 'tokensOfOwner',
        args: address ? [address] : undefined,
        query: {
            enabled: Boolean(address),
        },
    });

    return { tokenIds: data as bigint[] | undefined, isLoading: isLoading };
}

export function useAgreementMetadata(tokenId?: bigint) {
    const contractAddress = useContractAddress();
    const { data, isLoading } = useReadContract({
        address: contractAddress,
        abi: EDC_AGREEMENT_NFT_ABI,
        functionName: 'getAgreement',
        args: tokenId !== undefined ? [tokenId] : undefined,
        query: {
            enabled: tokenId !== undefined,
        },
    });

    return { agreement: data as AgreementMetadata | undefined, isLoading };
}

export function useMintTransactionHash(tokenId?: bigint) {
    const contractAddress = useContractAddress();
    const publicClient = usePublicClient();
    const [txHash, setTxHash] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!publicClient || !contractAddress) {
            return;
        }

        const fetchMintTx = async () => {
            setIsLoading(true);
            try {
                const logs = await publicClient.getLogs({
                    address: contractAddress,
                    event: {
                        type: 'event',
                        name: 'AgreementMinted',
                        inputs: [
                            { type: 'uint256', name: 'tokenId', indexed: true },
                            { type: 'string', name: 'agreementId', indexed: false },
                            { type: 'string', name: 'assetId', indexed: false },
                            { type: 'address', name: 'minter', indexed: true },
                            { type: 'address', name: 'recipient', indexed: true },
                            { type: 'string', name: 'providerId', indexed: false },
                            { type: 'string', name: 'consumerId', indexed: false },
                            { type: 'uint256', name: 'signedAt', indexed: false },
                        ],
                    },
                    args: {
                        tokenId: tokenId,
                    },
                    fromBlock: 0n,
                    toBlock: 'latest',
                });

                if (logs.length > 0) {
                    setTxHash(logs[0].transactionHash);
                }
            } catch (error) {
                console.error('Error fetching mint transaction:', error);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchMintTx();
    }, [tokenId, publicClient, contractAddress]);

    return { txHash, isLoading };
}

export function useTokenIdByAgreementId(agreementId?: string) {
    const contractAddress = useContractAddress();
    const { data: tokenId, isLoading } = useReadContract({
        address: contractAddress,
        abi: EDC_AGREEMENT_NFT_ABI,
        functionName: 'getTokenIdByAgreementId',
        args: agreementId ? [agreementId] : undefined,
        query: {
            enabled: Boolean(agreementId),
        },
    });

    return { tokenId: tokenId as bigint | undefined, isLoading };
}

export function useTotalSupply() {
    const contractAddress = useContractAddress();
    const { data: totalSupply, isLoading } = useReadContract({
        address: contractAddress,
        abi: EDC_AGREEMENT_NFT_ABI,
        functionName: 'totalSupply',
    });

    return { totalSupply: totalSupply as bigint | undefined, isLoading };
}
