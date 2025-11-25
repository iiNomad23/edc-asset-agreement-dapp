import React from 'react';
import { ContractAgreement } from '@/types/contract.ts';
import { ArrowRightLeft, FileText, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { formatTimestamp } from '@/lib/utils.ts';
import { CatalogAsset } from '@/types/catalog.ts';
import { Badge } from '@/components/ui/badge.tsx';
import { formatEther } from 'viem';
import { shortenString } from '@/lib/nftMetadataUtils.ts';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip.tsx';

interface AgreementCardProps {
    agreement: ContractAgreement;
    isConnected: boolean;
    isMinting: boolean;
    isInitiatingTransfer: boolean;
    onMint: () => void;
    onInitiateTransfer: () => void;
    asset?: CatalogAsset;
    mintPrice?: bigint;
}

const ContractAgreementCard: React.FC<AgreementCardProps> = ({
    agreement,
    isConnected,
    isMinting,
    isInitiatingTransfer,
    onMint,
    onInitiateTransfer,
    asset,
    mintPrice,
}) => {
    const formattedDate = formatTimestamp(agreement.contractSigningDate * 1000);
    const assetChainName = asset?.chainName;
    const assetChainId = asset?.chainId;
    const assetContractAddress = asset?.contractAddress;
    const isNftRequired = assetContractAddress && assetChainId;

    let expiresAt = 0;
    let isExpired = false;
    if (asset?.agreementExpiresAfter) {
        const signedAtInSeconds = agreement.contractSigningDate;
        const agreementExpiresAfterInSeconds = Number(asset.agreementExpiresAfter);
        const expiresAtInSeconds = signedAtInSeconds + agreementExpiresAfterInSeconds;
        const now = Math.floor(Date.now() / 1000);
        expiresAt = expiresAtInSeconds;
        isExpired = expiresAtInSeconds < now;
    }

    const renderMintButton = () => {
        return (
            <Button
                onClick={onMint}
                disabled={!isConnected || isMinting || isExpired}
                variant="outline"
                size="sm"
                className="w-full"
            >
                {isMinting ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Minting NFT...
                    </>
                ) : mintPrice ? (
                    <>
                    <span className="flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Mint contract agreement NFT
                    </span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                            <span className="flex items-center">
                                {`(${shortenString(formatEther(mintPrice), 3)} ETH)`}
                            </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <div className="space-y-1">
                                    <p className="font-semibold text-sm">Mint Price</p>
                                    <p className="text-xs">
                                        {`${formatEther(mintPrice)} ETH`}
                                    </p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </>
                ) : (
                    <>
                        <Shield className="w-4 h-4 mr-2" />
                        Mint contract agreement NFT
                    </>
                )}
            </Button>
        );
    };

    const renderInitiateTransferButton = () => {
        return (
            <Button
                onClick={onInitiateTransfer}
                disabled={isInitiatingTransfer || isExpired}
                variant="outline"
                size="sm"
                className="w-full"
            >
                {isInitiatingTransfer ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Initiating Transfer...
                    </>
                ) : (
                    <>
                        <ArrowRightLeft className="w-4 h-4 mr-2" />
                        Initiate Data Transfer
                    </>
                )}
            </Button>
        );
    };

    return (
        <Card className="flex flex-col h-full min-w-[320px]">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            Agreement
                        </CardTitle>
                        <CardDescription className="mt-1">
                            <p className="text-muted-foreground break-all">
                                Type: {agreement['@type']}
                            </p>
                        </CardDescription>
                    </div>
                    {isNftRequired && (
                        <div className="flex items-center gap-2 h-7">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="secondary">
                                        NFT Required
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <div className="space-y-2 text-sm">
                                        {assetChainName ? (
                                            <div>
                                                <p className="text-neutral-400 dark:text-neutral-600 mb-1">Chain
                                                    Name</p>
                                                <p className="font-mono text-xs break-all">{assetChainName}</p>
                                            </div>
                                        ) : null}
                                        <div>
                                            <p className="text-neutral-400 dark:text-neutral-600 mb-1">Chain ID</p>
                                            <p className="font-mono text-xs break-all">{assetChainId}</p>
                                        </div>
                                        <div>
                                            <p className="text-neutral-400 dark:text-neutral-600 mb-1">Contract
                                                Address</p>
                                            <p className="font-mono text-xs break-all">{assetContractAddress}</p>
                                        </div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col justify-end">
                <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-muted-foreground mb-1">Agreement ID</p>
                            <p className="font-mono text-xs break-all">{agreement['@id']}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1">Signed At</p>
                            <p className="font-mono text-xs">{formattedDate}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-muted-foreground mb-1">Asset ID</p>
                            <p className="font-mono text-xs break-all">{agreement.assetId}</p>
                        </div>
                        {expiresAt > 0 && (
                            <div>
                                <p className="text-muted-foreground mb-1">{isExpired ? 'Expired At' : 'Expires At'}</p>
                                <p className="font-mono text-xs break-all">{formatTimestamp(expiresAt * 1000)}</p>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <div>
                            <p className="text-muted-foreground mb-1">Provider</p>
                            <p className="font-mono text-xs break-all">{agreement.providerId}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-1">Consumer</p>
                            <p className="font-mono text-xs break-all">{agreement.consumerId}</p>
                        </div>
                    </div>
                </div>

                {!isConnected ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="flex items-center">
                                {renderMintButton()}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">
                                Connect your wallet to mint agreement NFTs
                            </p>
                        </TooltipContent>
                    </Tooltip>
                ) : isExpired ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="flex items-center">
                                {renderMintButton()}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">
                                Agreement is already expired
                            </p>
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    renderMintButton()
                )}

                {isExpired ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="flex items-center">
                                {renderInitiateTransferButton()}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-xs">
                                Agreement is already expired
                            </p>
                        </TooltipContent>
                    </Tooltip>
                ) : (
                    renderInitiateTransferButton()
                )}
            </CardContent>
        </Card>
    );
};

export default ContractAgreementCard;
