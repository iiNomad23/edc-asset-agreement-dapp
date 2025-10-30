import React, { useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useAgreementTokens, useContractAddress, useEDCAgreementNFT } from '@/hooks/useEDCAgreementNFT.ts';
import { AlertTriangle, Loader2, Shield, ShieldX } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button.tsx';
import AgreementNFTCard from '@/components/cards/AgreementNFTCard.tsx';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { parseContractError, parseTransactionRevertedErrorData } from '@/lib/contractUtils.ts';
import { TransactionRevertedError } from '@/errors/transactionRevertedError.ts';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label.tsx';
import { cn } from '@/lib/utils.ts';
import { QueryKey, useQueryClient } from '@tanstack/react-query';

const MyNFTsPage: React.FC = () => {
    const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
    const [selectedTokenId, setSelectedTokenId] = useState<bigint | undefined>();
    const [selectedQueryKey, setSelectedQueryKey] = useState<QueryKey | undefined>();
    const [revokeReason, setRevokeReason] = useState('');
    const [isRevoking, setIsRevoking] = useState(false);
    const queryClient = useQueryClient();

    const { address, isConnected } = useAccount();
    const chainId = useChainId();
    const { tokenIds, isLoading } = useAgreementTokens(address);
    const contractAddress = useContractAddress();
    const { revokeAgreement } = useEDCAgreementNFT();

    const handleRevokeClick = (tokenId: bigint, queryKey: QueryKey) => {
        setSelectedTokenId(tokenId);
        setSelectedQueryKey(queryKey);
        setRevokeReason('');
        setRevokeDialogOpen(true);
    };

    const handleRevokeConfirm = async () => {
        if (!selectedTokenId) {
            return;
        }

        try {
            setIsRevoking(true);

            await revokeAgreement(selectedTokenId, revokeReason.trim());

            toast.success('The agreement has been successfully revoked');

            await queryClient.invalidateQueries({ queryKey: selectedQueryKey });

            setRevokeDialogOpen(false);
            setSelectedTokenId(undefined);
            setSelectedQueryKey(undefined);
            setRevokeReason('');
        } catch (error) {
            const message = parseContractError(error);
            if (error instanceof TransactionRevertedError) {
                const toastData = parseTransactionRevertedErrorData(error, chainId);
                toast.error(message, toastData);
            } else {
                toast.error(message);
            }
        } finally {
            setIsRevoking(false);
        }
    };

    const handleDialogClose = (open: boolean) => {
        if (isRevoking) {
            return;
        }

        setRevokeDialogOpen(open);
        if (!open) {
            setSelectedTokenId(undefined);
            setSelectedQueryKey(undefined);
            setRevokeReason('');
        }
    };

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
        <>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-1">My Agreement NFTs</h2>
                    <p className="text-sm text-muted-foreground">
                        You have {tokenIds.length} agreement NFT{tokenIds.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tokenIds.map((tokenId) => (
                        <AgreementNFTCard
                            key={tokenId.toString()}
                            tokenId={tokenId}
                            contractAddress={contractAddress}
                            onRevokeClick={handleRevokeClick}
                        />
                    ))}
                </div>
            </div>

            <AlertDialog open={revokeDialogOpen} onOpenChange={handleDialogClose}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-xl text-foreground">
                            <ShieldX className="w-6 h-6 text-red-600 dark:text-red-500" />
                            <span>Revoke Agreement NFT</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base text-muted-foreground">
                            This action will permanently revoke NFT #{selectedTokenId?.toString()} on the blockchain.
                            This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="revoke-reason"
                                className="text-sm font-semibold text-foreground"
                            >
                                Reason for Revocation (Optional)
                            </Label>
                            <Input
                                id="revoke-reason"
                                placeholder="e.g., Contract breach, Agreement expired, Security concerns..."
                                value={revokeReason}
                                onChange={(e) => setRevokeReason(e.target.value)}
                                disabled={isRevoking}
                                className="w-full bg-background text-foreground border-input"
                            />
                            <p className="text-xs text-muted-foreground">
                                This reason will be permanently recorded on-chain.
                            </p>
                        </div>
                        <div
                            className="bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-400 dark:border-amber-600 rounded-lg p-4">
                            <div className="flex items-start gap-2 mb-2">
                                <AlertTriangle
                                    className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                                    Warning
                                </p>
                            </div>
                            <ul className="text-sm text-amber-900 dark:text-amber-100 space-y-1.5 ml-7">
                                <li className="flex items-start">
                                    <span className="mr-2 font-bold">•</span>
                                    <span className="font-semibold">This action is irreversible</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2 font-bold">•</span>
                                    <span className="font-semibold">The NFT will be marked as revoked permanently</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="mr-2 font-bold">•</span>
                                    <span className="font-semibold">Gas fees will apply for this transaction</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter className="gap-2 sm:gap-2">
                        <AlertDialogCancel
                            disabled={isRevoking}
                            className="font-semibold"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                void handleRevokeConfirm();
                            }}
                            disabled={isRevoking}
                            className={cn(
                                buttonVariants({ variant: 'destructive' }),
                                'font-semibold',
                            )}
                        >
                            {isRevoking ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    <span>Revoking...</span>
                                </>
                            ) : (
                                <>
                                    <ShieldX className="w-4 h-4 mr-2" />
                                    <span>Confirm Revocation</span>
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default MyNFTsPage;
