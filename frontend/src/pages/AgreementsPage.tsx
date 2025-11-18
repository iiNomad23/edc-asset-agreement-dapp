import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FileText, Loader2 } from 'lucide-react';
import { ContractAgreement } from '@/types/contract.ts';
import ContractAgreementCard from '@/components/cards/ContractAgreementCard.tsx';
import { useAccount, useChainId } from 'wagmi';
import { useEDCAgreementNFT, useMintPrice } from '@/hooks/useEDCAgreementNFT.ts';
import { toast } from 'sonner';
import { generateAgreementMetadata, metadataToDataURI } from '@/lib/nftMetadataUtils.ts';
import { BACKEND_URL } from '@/config/env.ts';
import { parseContractError, parseTransactionRevertedErrorData } from '@/lib/contractUtils.ts';
import { DEFAULT_BADGE_IMAGE } from '@/config/constants.ts';
import { TransactionRevertedError } from '@/errors/transactionRevertedError.ts';
import { TransferProcessRequest } from '@/types/transfer.ts';
import { handleApiError } from '@/lib/apiUtils.ts';
import { CatalogAsset } from '@/types/catalog.ts';
import { useAssetsQuery } from '@/hooks/useAssetsQuery.ts';
import { Button } from '@/components/ui/button.tsx';
import { Link } from 'react-router-dom';

const AgreementsPage = (): React.ReactNode => {
    const [mintingAgreementId, setMintingAgreementId] = useState<string | null>(null);
    const [initiatingTransferAgreementId, setInitiatingTransferAgreementId] = useState<string | null>(null);
    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { mintAgreement } = useEDCAgreementNFT();
    const { mintPrice } = useMintPrice();

    const { data: assetsData, isLoading: isLoadingAssets } = useAssetsQuery();
    const { data: agreements, isLoading: isLoadingAgreements } = useQuery({
        queryKey: ['agreements'],
        queryFn: async () => {
            const response = await fetch(`${BACKEND_URL}/api/contracts/agreements`);
            if (!response.ok) {
                await handleApiError(response);
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
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                await handleApiError(response);
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

    const getAssetForAgreement = (assetId: string): CatalogAsset | undefined => {
        if (!assetsData?.assets) {
            return undefined;
        }

        return assetsData.assets.find((asset: CatalogAsset) => asset.id === assetId);
    };

    const handleMintNFT = async (agreement: ContractAgreement) => {
        if (!address) {
            toast.error('Please connect your wallet first');
            return;
        }

        if (mintPrice === undefined) {
            toast.error('Unable to fetch mint price');
            return;
        }

        try {
            setMintingAgreementId(agreement['@id']);

            const asset = getAssetForAgreement(agreement.assetId);
            if (!asset) {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error(`Asset ${agreement.assetId} not found`);
            }

            const signedAtInSeconds = BigInt(agreement.contractSigningDate);
            let expiresAtInSeconds = 0n;

            if (asset.agreementExpiresAfter) {
                const agreementExpiresAfterInSeconds = BigInt(asset.agreementExpiresAfter);
                expiresAtInSeconds = signedAtInSeconds + agreementExpiresAfterInSeconds;
            }

            const metadata = generateAgreementMetadata(agreement, DEFAULT_BADGE_IMAGE);
            const tokenURI = metadataToDataURI(metadata);

            await mintAgreement({
                recipient: address,
                agreementId: agreement['@id'],
                assetId: agreement.assetId,
                providerId: agreement.providerId,
                consumerId: agreement.consumerId,
                signedAt: signedAtInSeconds,
                expiresAt: expiresAtInSeconds,
                tokenURI: tokenURI,
            }, mintPrice);

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

    if (isLoadingAgreements || isLoadingAssets) {
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

            {agreements && agreements.length > 0 ? (
                <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {agreements.map((agreement) => {
                        const asset = getAssetForAgreement(agreement.assetId);
                        return (
                            <ContractAgreementCard
                                key={agreement['@id']}
                                agreement={agreement}
                                isConnected={isConnected}
                                isMinting={isMinting(agreement['@id'])}
                                isInitiatingTransfer={isInitiatingTransfer(agreement['@id'])}
                                onMint={() => handleMintNFT(agreement)}
                                onInitiateTransfer={() => handleInitiateTransfer(agreement)}
                                asset={asset}
                                mintPrice={mintPrice}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
                    <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No contract agreements found</h3>
                    <p className="text-muted-foreground max-w-md mb-4">
                        Negotiate contracts from the Assets page to create agreements.
                    </p>
                    <Button asChild>
                        <Link to="/">Go to Assets</Link>
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AgreementsPage;
