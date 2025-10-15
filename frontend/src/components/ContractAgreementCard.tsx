import React from 'react';
import { ContractAgreement } from '@/types/contract.ts';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';

interface AgreementCardProps {
    agreement: ContractAgreement;
    isConnected: boolean;
    isMinting: boolean;
    onMint: () => void;
}

const AgreementCard: React.FC<AgreementCardProps> = ({ agreement, isConnected, isMinting, onMint }) => {
    const signingDate = new Date(agreement.contractSigningDate * 1000);
    const formattedDate = signingDate.toLocaleDateString(window.navigator.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="border rounded-lg p-4 space-y-3">
            <div className="space-y-2">
                <div>
                    <h3 className="font-semibold text-lg">Agreement</h3>
                    <p className="text-sm text-muted-foreground font-mono truncate">
                        {agreement['@id']}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground">Asset ID:</span>
                        <p className="font-mono truncate">{agreement.assetId}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Signed:</span>
                        <p>{formattedDate}</p>
                    </div>
                </div>

                <div className="text-sm space-y-1">
                    <div>
                        <span className="text-muted-foreground">Provider:</span>
                        <p className="font-mono truncate">{agreement.providerId}</p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Consumer:</span>
                        <p className="font-mono truncate">{agreement.consumerId}</p>
                    </div>
                </div>
            </div>

            <Button
                onClick={onMint}
                disabled={!isConnected || isMinting}
                className="w-full"
                size="sm"
            >
                {isMinting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Minting NFT...
                    </>
                ) : (
                    'Mint contract agreement NFT'
                )}
            </Button>
        </div>
    );
};

export default AgreementCard;
