import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ContractAgreement } from '@/types/contract.ts';
import AgreementCard from '@/components/ContractAgreementCard.tsx';
import { useAccount } from 'wagmi';
import { useEDCAgreementNFT } from '@/hooks/useEDCAgreementNFT.ts';
import { toast } from 'sonner';
import { generateAgreementMetadata, metadataToDataURI } from '@/lib/nftMetadata.ts';

const AgreementsPage = (): React.ReactNode => {
    const { address, isConnected } = useAccount();
    const [mintingAgreementId, setMintingAgreementId] = useState<string | null>(null);

    const {
        mintAgreement,
        isWritePending,
        isTxConfirming,
        isTxConfirmed,
        writeError,
    } = useEDCAgreementNFT();

    const { data: agreements, isLoading } = useQuery({
        queryKey: ['agreements'],
        queryFn: async () => {
            const response = await fetch('http://localhost:8190/api/contracts/agreements');
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

            const metadata = generateAgreementMetadata(agreement, import.meta.env.VITE_DEFAULT_BADGE_IMAGE);
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
            console.error('Minting error:', error);
            toast.error('Failed to mint NFT. Please try again.');
            setMintingAgreementId(null);
        }
    };

    React.useEffect(() => {
        if (isTxConfirmed) {
            toast.success('NFT minted successfully!');
            setMintingAgreementId(null);
        }
    }, [isTxConfirmed]);

    React.useEffect(() => {
        if (writeError) {
            toast.error(`Minting failed: ${writeError.message}`);
            setMintingAgreementId(null);
        }
    }, [writeError]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    const isMinting = (agreementId: string) => {
        return mintingAgreementId === agreementId && (isWritePending || isTxConfirming);
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
