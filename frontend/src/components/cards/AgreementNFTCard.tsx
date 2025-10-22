import React from 'react';
import { useAgreementMetadata, useMintTimestamp, useMintTransactionHash } from '@/hooks/useEDCAgreementNFT.ts';
import { ExternalLink, Loader2, Shield, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { formatTimestamp } from '@/lib/utils.ts';
import { Address } from 'viem';
import { shortenId } from '@/lib/nftMetadataUtils.ts';
import { useChainId } from 'wagmi';
import CopyButton from '@/components/CopyButton.tsx';
import { ETHERSCAN_BASES } from '@/config/constants.ts';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';

const AgreementNFTCard: React.FC<{ tokenId: bigint, contractAddress: Address }> = ({ tokenId, contractAddress }) => {
    const { agreement, isLoading } = useAgreementMetadata(tokenId);
    const { txHash, isLoading: txHashLoading, error: txHashError } = useMintTransactionHash(tokenId);
    const { mintTimestamp, isLoading: mintLoading, error: mintError } = useMintTimestamp(txHash);
    const chainId = useChainId();

    const explorerUrls = React.useMemo(() => {
        const baseUrl = ETHERSCAN_BASES[chainId];
        return {
            nft: baseUrl ? `${baseUrl}/nft/${contractAddress}/${tokenId}` : null,
            transaction: baseUrl && txHash ? `${baseUrl}/tx/${txHash}` : null,
            isLocalNetwork: baseUrl === '',
        };
    }, [chainId, contractAddress, tokenId, txHash]);

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center p-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    if (!agreement) {
        return null;
    }

    const isValid = !agreement.isRevoked &&
        (agreement.expiresAt === 0n || agreement.expiresAt > BigInt(Math.floor(Date.now() / 1000)));

    return (
        <Card className={agreement.isRevoked ? 'opacity-60 border-red-200' : ''}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            {isValid ? (
                                <Shield className="w-5 h-5 text-green-500" />
                            ) : (
                                <ShieldAlert className="w-5 h-5 text-red-500" />
                            )}
                            NFT #{tokenId.toString()}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            <div>
                                <p className="text-muted-foreground mb-1 break-all flex items-center">
                                    Contract: {shortenId(contractAddress, 8)}
                                    <CopyButton text={contractAddress} />
                                </p>
                                <p className="text-muted-foreground mb-1 break-all flex items-center flex-wrap gap-3">
                                    <span className="flex items-center">
                                        {txHashLoading ? (
                                            <>
                                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                Loading tx...
                                            </>
                                        ) : txHashError ? (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="flex items-center text-yellow-600 cursor-help">
                                                        TxHash: Unable to load
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">
                                                    {txHashError}
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : txHash ? (
                                            <>
                                                TxHash: {shortenId(txHash, 8)}
                                                <CopyButton text={txHash} />
                                            </>
                                        ) : (
                                            'TxHash: N/A'
                                        )}
                                    </span>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {mintLoading ? (
                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                        ) : mintError ? (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="flex items-center text-yellow-600 cursor-help">
                                                        Unable to load mint date
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent side="top">
                                                    {mintError}
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : mintTimestamp ? (
                                            <>
                                                @ {formatTimestamp(mintTimestamp.getTime())}
                                            </>
                                        ) : null}
                                    </span>
                                </p>
                            </div>
                        </CardDescription>
                    </div>
                    <Badge variant={isValid ? 'default' : 'destructive'}>
                        {agreement.isRevoked ? 'Revoked' : isValid ? 'Valid' : 'Expired'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col justify-end">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground mb-1">Agreement ID</p>
                        <p className="font-mono text-xs break-all">{agreement.agreementId}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground mb-1">Signed At</p>
                        <p className="font-mono text-xs">{formatTimestamp(Number(agreement.signedAt) * 1000)}</p>
                    </div>
                </div>
                <div className="space-y-2 text-sm">
                    <div>
                        <p className="text-muted-foreground mb-1">Asset ID</p>
                        <p className="font-mono text-xs break-all">{agreement.assetId}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground mb-1">Provider</p>
                        <p className="font-mono text-xs break-all">{agreement.providerId}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground mb-1">Consumer</p>
                        <p className="font-mono text-xs break-all">{agreement.consumerId}</p>
                    </div>
                </div>

                {agreement.expiresAt > 0n && (
                    <div className="text-sm">
                        <p className="text-muted-foreground mb-1">Expires At</p>
                        <p className="text-xs">{formatTimestamp(Number(agreement.signedAt) * 1000)}</p>
                    </div>
                )}

                {agreement.isRevoked && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                        <p className="font-semibold text-red-800 mb-1">Revocation Details</p>
                        <p className="text-red-700 text-xs mb-1">
                            {formatTimestamp(Number(agreement.signedAt) * 1000)}
                        </p>
                        {agreement.revokeReason && (
                            <p className="text-red-600 text-xs italic">"{agreement.revokeReason}"</p>
                        )}
                    </div>
                )}

                {explorerUrls.nft ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                    >
                        <a href={explorerUrls.nft} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            <span>View NFT on Explorer</span>
                        </a>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" className="w-full" disabled>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Local Network
                    </Button>
                )}

                {explorerUrls.transaction ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                    >
                        <a href={explorerUrls.transaction} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Transaction
                        </a>
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" className="w-full" disabled>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {txHashLoading ? (
                            <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Loading...
                            </>
                        ) : txHashError ? (
                            'Transaction Unavailable'
                        ) : explorerUrls.isLocalNetwork ? (
                            'Local Network'
                        ) : (
                            'No Transaction'
                        )}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default AgreementNFTCard;
