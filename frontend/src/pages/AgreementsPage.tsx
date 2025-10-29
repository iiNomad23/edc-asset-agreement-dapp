import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ContractAgreement } from '@/types/contract.ts';
import AgreementCard from '@/components/cards/ContractAgreementCard.tsx';
import { useAccount, useChainId } from 'wagmi';
import { useEDCAgreementNFT } from '@/hooks/useEDCAgreementNFT.ts';
import { toast } from 'sonner';
import { generateAgreementMetadata, metadataToDataURI } from '@/lib/nftMetadataUtils.ts';
import { BACKEND_URL } from '@/config/env.ts';
import { parseContractError, parseTransactionRevertedErrorData } from '@/lib/contractErrorUtils.ts';
import { DEFAULT_BADGE_IMAGE } from '@/config/constants.ts';
import { TransactionRevertedError } from '@/errors/TransactionRevertedError.ts';
import { TransferProcessRequest } from '@/types/transfer.ts';

const AgreementsPage = (): React.ReactNode => {
    const [mintingAgreementId, setMintingAgreementId] = useState<string | null>(null);
    const [initiatingTransferAgreementId, setInitiatingTransferAgreementId] = useState<string | null>(null);
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { mintAgreement } = useEDCAgreementNFT();

    const { data: agreements, isLoading } = useQuery({
        queryKey: ['agreements'],
        queryFn: async () => {
            const response = await fetch(`${BACKEND_URL}/api/contracts/agreements`);
            if (!response.ok) {
                throw new Error('Failed to fetch agreements');
            }
            return await response.json() as Promise<ContractAgreement[]>;
        },
        refetchInterval: 30000,
    });

    const transferProcessMutation = useMutation({
        mutationFn: async (request: TransferProcessRequest) => {
            const response = await fetch(`${BACKEND_URL}/api/transfers/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    assetId: request.assetId,
                    contractId: request.contractId,
                    transferType: request.transferType,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message ?? 'Failed to initiate transfer');
            }

            return response.json();
        },
        onSuccess: async (data) => {
            try {
                const waitResponse = await fetch(`${BACKEND_URL}/api/transfers/${data['@id']}/wait`);
                const result = await waitResponse.json();
                if (!waitResponse.ok) {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error(result.message);
                }

                toast.success('Transfer Initiated Successfully', {
                    description: `Transfer ID: ${data['@id']}`,
                    duration: 5000,
                });
            } catch (error) {
                console.error(error);
                toast.error('Transfer Initiation Delayed', {
                    description: error instanceof Error ? error.message : 'Check the Transfers page for status',
                    duration: 5000,
                });
            } finally {
                setInitiatingTransferAgreementId(null);
            }
        },
        onError: (error: Error) => {
            console.error('Initiating transfer error:', error);
            toast.error('Initiating Transfer Failed', {
                description: error.message ?? 'Unknown error',
                duration: 5000,
            });
            setInitiatingTransferAgreementId(null);
        },
    });

    const handleMintNFT = async (agreement: ContractAgreement) => {
        if (!address) {
            toast.error('Please connect your wallet first');
            return;
        }

        try {
            setMintingAgreementId(agreement['@id']);

            const metadata = generateAgreementMetadata(agreement, DEFAULT_BADGE_IMAGE);
            const tokenURI = metadataToDataURI(metadata);

            await mintAgreement({
                recipient: address,
                agreementId: agreement['@id'],
                assetId: agreement.assetId,
                providerId: agreement.providerId,
                consumerId: agreement.consumerId,
                signedAt: BigInt(agreement.contractSigningDate),
                expiresAt: 0n,
                tokenURI: tokenURI,
            });

            toast.success('NFT minting successful!');
        } catch (error) {
            const message = parseContractError(error);

            if (error instanceof TransactionRevertedError) {
                const toastData = parseTransactionRevertedErrorData(error, chainId);
                toast.error(message, toastData);
            } else {
                toast.error(message);
            }
        } finally {
            setMintingAgreementId(null);
        }
    };

    const handleInitiateTransfer = async (agreement: ContractAgreement) => {
        setInitiatingTransferAgreementId(agreement['@id']);

        const request: TransferProcessRequest = {
            assetId: agreement.assetId,
            contractId: agreement['@id'],
            transferType: 'HttpData-PULL',
        };

        transferProcessMutation.mutate(request);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    const isMinting = (agreementId: string) => {
        return mintingAgreementId === agreementId;
    };

    const isInitiatingTransfer = (agreementId: string) => {
        return initiatingTransferAgreementId === agreementId;
    };

    return (
        <div className="grid gap-6">
            <div>
                <h2 className="text-2xl font-bold mb-1">Contract Agreements</h2>
                <p className="text-sm text-muted-foreground">
                    View all your finalized contract agreements
                </p>
            </div>

            {!isConnected && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                        Connect your wallet to mint agreement NFTs
                    </p>
                </div>
            )}

            {agreements && agreements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agreements.map((agreement) => (
                        <AgreementCard
                            key={agreement['@id']}
                            agreement={agreement}
                            isConnected={isConnected}
                            isMinting={isMinting(agreement['@id'])}
                            isInitiatingTransfer={isInitiatingTransfer(agreement['@id'])}
                            onMint={() => handleMintNFT(agreement)}
                            onInitiateTransfer={() => handleInitiateTransfer(agreement)} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 border rounded-lg">
                    <p className="text-muted-foreground">No contract agreements found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Negotiate contracts from the Assets page to create agreements
                    </p>
                </div>
            )}
        </div>
    );
};

export default AgreementsPage;
