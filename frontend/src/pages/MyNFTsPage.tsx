import React from 'react';
import { useAccount } from 'wagmi';
import { useAgreementTokens, useContractAddress } from '@/hooks/useEDCAgreementNFT.ts';
import { Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import AgreementNFTCard from '@/components/cards/AgreementNFTCard.tsx';
import { Link } from 'react-router-dom';

const MyNFTsPage: React.FC = () => {
    const { address, isConnected } = useAccount();
    const { tokenIds, isLoading } = useAgreementTokens(address);
    const contractAddress = useContractAddress();

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <Shield className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
                <p className="text-muted-foreground max-w-md">
                    Connect your wallet to view your EDC Agreement NFTs
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!tokenIds || tokenIds.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-1">My Agreement NFTs</h2>
                    <p className="text-sm text-muted-foreground">
                        View and manage your minted contract agreement NFTs
                    </p>
                </div>

                <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
                    <Shield className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No NFTs Yet</h3>
                    <p className="text-muted-foreground max-w-md mb-4">
                        You haven't minted any agreement NFTs yet. Visit the Agreements page to mint your first NFT.
                    </p>
                    <Button asChild>
                        <Link to="/agreements">Go to Agreements</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-1">My Agreement NFTs</h2>
                <p className="text-sm text-muted-foreground">
                    You have {tokenIds.length} agreement NFT{tokenIds.length !== 1 ? 's' : ''}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tokenIds.map((tokenId) => (
                    <AgreementNFTCard key={tokenId.toString()} tokenId={tokenId} contractAddress={contractAddress} />
                ))}
            </div>
        </div>
    );
};

export default MyNFTsPage;
