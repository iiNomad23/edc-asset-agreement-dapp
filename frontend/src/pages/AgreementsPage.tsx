import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

const AgreementsPage = (): React.ReactNode => {
    const [mintingAgreementId, setMintingAgreementId] = useState<string | null>(null);
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
                            onMint={() => handleMintNFT(agreement)}
                        />
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
