import { useAccount, useChainId, usePublicClient, useReadContract, useWriteContract } from 'wagmi';
import { Address, Hash } from 'viem';
import { EDC_AGREEMENT_NFT_ABI } from '@/config/abis/contractAgreementNFTabi.ts';
import { useEffect, useState } from 'react';
import { CONTRACT_ADDRESSES } from '@/config/constants.ts';
import { estimateGasWithBuffer, validatePublicClient, validateTransactionReceipt } from '@/lib/contractUtils.ts';

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

export function useContractAddress(): Address {
    const chainId = useChainId();
    return CONTRACT_ADDRESSES[chainId];
}

export function useEDCAgreementNFT() {
    const contractAddress = useContractAddress();
    const publicClient = usePublicClient();
    const { address } = useAccount();

    const {
        writeContractAsync,
        reset,
    } = useWriteContract();

    const mintAgreement = async (params: MintAgreementParams): Promise<string> => {
        reset();
        validatePublicClient(publicClient);

        const contractCall = {
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
            account: address,
        };

        const gas = await estimateGasWithBuffer(publicClient, contractCall);
        const txHash = await writeContractAsync({
            ...contractCall,
            gas: gas,
        });

        const receipt = await publicClient.waitForTransactionReceipt({
            hash: txHash,
        });

        validateTransactionReceipt(receipt);

        return txHash;
    };

    const revokeAgreement = async (tokenId: bigint, reason: string): Promise<string> => {
        reset();
        validatePublicClient(publicClient);

        const contractCall = {
            address: contractAddress,
            abi: EDC_AGREEMENT_NFT_ABI,
            functionName: 'revokeAgreement',
            args: [tokenId, reason],
            account: address,
        };

        const gas = await estimateGasWithBuffer(publicClient, contractCall);
        const txHash = await writeContractAsync({
            ...contractCall,
            gas: gas,
        });

        const receipt = await publicClient.waitForTransactionReceipt({
            hash: txHash,
        });

        validateTransactionReceipt(receipt);

        return txHash;
    };

    return {
        mintAgreement,
        revokeAgreement,
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
    const { data, isLoading, queryKey } = useReadContract({
        address: contractAddress,
        abi: EDC_AGREEMENT_NFT_ABI,
        functionName: 'getAgreement',
        args: tokenId !== undefined ? [tokenId] : undefined,
        query: {
            enabled: tokenId !== undefined,
        },
    });

    return { agreement: data as AgreementMetadata | undefined, isLoading, queryKey };
}

export function useMintTransactionHash(tokenId?: bigint) {
    const contractAddress = useContractAddress();
    const publicClient = usePublicClient();
    const [txHash, setTxHash] = useState<Hash | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        if (!tokenId || !publicClient || !contractAddress) {
            return;
        }

        const fetchMintTx = async () => {
            setIsLoading(true);
            setError(undefined);
            try {
                const currentBlock = await publicClient.getBlockNumber();

                // query in chunks to avoid rate limits by free tier
                const CHUNK_SIZE = 10000n;
                const MAX_BLOCKS_TO_SEARCH = 100000n;

                let fromBlock = currentBlock > MAX_BLOCKS_TO_SEARCH
                    ? currentBlock - MAX_BLOCKS_TO_SEARCH
                    : 0n;

                while (fromBlock <= currentBlock) {
                    const toBlock = fromBlock + CHUNK_SIZE > currentBlock
                        ? currentBlock
                        : fromBlock + CHUNK_SIZE;

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
                            fromBlock,
                            toBlock,
                        });

                        if (logs.length > 0) {
                            setTxHash(logs[0].transactionHash);
                            return;
                        }
                    } catch (chunkError) {
                        console.warn(`Failed to fetch logs for blocks ${fromBlock}-${toBlock}:`, chunkError);
                    }

                    fromBlock = toBlock + 1n;
                }

                setError('Transaction not found in recent blocks');
            } catch (error) {
                console.error('Error fetching mint transaction:', error);
                setError('Failed to fetch transaction');
            } finally {
                setIsLoading(false);
            }
        };

        void fetchMintTx();
    }, [tokenId, publicClient, contractAddress]);

    return { txHash, isLoading, error };
}

export function useMintTimestamp(txHash?: Hash) {
    const publicClient = usePublicClient();
    const [mintTimestamp, setMintTimestamp] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!txHash || !publicClient) {
            return;
        }

        const fetchTimestamp = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
                const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });
                setMintTimestamp(new Date(Number(block.timestamp) * 1000));
            } catch (err) {
                console.error('Error fetching mint timestamp:', err);
                setError('Failed to load timestamp');
            } finally {
                setIsLoading(false);
            }
        };

        void fetchTimestamp();
    }, [txHash, publicClient]);

    return { mintTimestamp, isLoading, error };
}
