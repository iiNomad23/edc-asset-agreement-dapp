import React, { useState } from 'react';
import { BACKEND_URL } from '@/config/env.ts';
import { useQuery } from '@tanstack/react-query';
import { TransferProcess } from '@/types/transfer.ts';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import DataTransferCard from '@/components/cards/DataTransferCard.tsx';
import { useAccount, useChainId, useSignMessage } from 'wagmi';
import { createSiweMessage, SiweMessage } from 'viem/siwe';
import { CatalogAsset } from '@/types';

const TransfersPage: React.FC = () => {
    const [fetchingTransferId, setFetchingTransferId] = useState<string | null>(null);
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const currentChainId = useChainId();

    const { data: transfers, isLoading } = useQuery({
        queryKey: ['transfers'],
        queryFn: async () => {
            const response = await fetch(`${BACKEND_URL}/api/transfers`);
            if (!response.ok) {
                throw new Error('Failed to fetch transfers');
            }
            return await response.json() as Promise<TransferProcess[]>;
        },
        refetchInterval: 30000,
    });

    const getAssetDetails = async (assetId: string) => {
        const response = await fetch(`${BACKEND_URL}/api/assets`);
        if (!response.ok) {
            throw new Error('Failed to fetch assets');
        }
        const assetsData = await response.json();
        return assetsData.assets.find((asset: CatalogAsset) => asset.id === assetId);
    };

    const generateSIWESignature = async (requiredChainId: number) => {
        if (!isConnected || !address) {
            throw new Error('No Ethereum wallet connected. Please connect your wallet.');
        }

        if (currentChainId !== requiredChainId) {
            throw new Error(
                `Please switch to chain ID ${requiredChainId} in your wallet`,
            );
        }

        const nonce = Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);

        const message: SiweMessage = {
            domain: window.location.host,
            address: address,
            uri: window.location.origin,
            version: '1',
            chainId: requiredChainId,
            nonce: nonce,
            statement: 'Sign in to access protected data asset',
            issuedAt: new Date(),
            expirationTime: new Date(Date.now() + 10 * 60 * 1000),
        };

        const messageToSign = createSiweMessage(message);
        const signature = await signMessageAsync({
            message: messageToSign,
        });

        return {
            signature: signature,
            message: {
                ...message
            },
        };
    };

    const handleFetchData = async (transfer: TransferProcess) => {
        try {
            setFetchingTransferId(transfer['@id']);

            const asset: CatalogAsset = await getAssetDetails(transfer.assetId);
            if (!asset) {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error(`Asset ${transfer.assetId} not found`);
            }

            if (asset.contractAddress && asset.chainId && asset.chainName) {
                const { signature, message } = await generateSIWESignature(Number(asset.chainId));

                const response = await fetch(
                    `${BACKEND_URL}/api/transfers/fetch-data`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            transferProcessId: transfer['@id'],
                            correlationId: transfer.correlationId,
                            signature: signature,
                            message: message,
                        }),
                    },
                );

                if (!response.ok) {
                    const error = await response.json();
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error(error.message ?? 'Verification failed');
                }

                const data = await response.json();

                toast.success('Data fetched successfully!', {
                    description: 'NFT verification passed',
                    duration: 5000,
                });

                console.log('Fetched data (with NFT verification):', data);
            } else {
                const response = await fetch(
                    `${BACKEND_URL}/api/transfers/${transfer['@id']}/fetch-data`,
                );

                if (!response.ok) {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error('Failed to fetch data');
                }

                const data = await response.json();

                toast.success('Data fetched successfully!', {
                    description: 'Check the console for the data',
                    duration: 5000,
                });

                console.log('Fetched data (standard):', data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error fetching data', {
                description: error instanceof Error ? error.message : 'Unknown error',
                duration: 5000,
            });
        } finally {
            setFetchingTransferId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            <div>
                <h2 className="text-2xl font-bold mb-1">Data Transfers</h2>
                <p className="text-sm text-muted-foreground">
                    View and manage your data transfer processes
                </p>
            </div>

            {transfers && transfers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {transfers.map((transfer) => (
                        <DataTransferCard
                            key={transfer['@id']}
                            transfer={transfer}
                            onFetchData={handleFetchData}
                            isFetching={fetchingTransferId === transfer['@id']}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 border rounded-lg">
                    <p className="text-muted-foreground">No data transfers found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Initiate transfers from the Agreements page
                    </p>
                </div>
            )}
        </div>
    );
};

export default TransfersPage;
