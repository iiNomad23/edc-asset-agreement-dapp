import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { CatalogAsset } from '@/types';

interface CatalogAssetCardProps {
    asset: CatalogAsset;
    isSubscribing: boolean;
    onSubscribe: () => void;
}

const CatalogAssetCard: React.FC<CatalogAssetCardProps> = ({ asset, isSubscribing, onSubscribe }) => {
    const assetDescription = asset.description;
    const assetPolicy = asset['odrl:hasPolicy'];

    return (
        <div className="border rounded-lg p-4 space-y-3">
            <div>
                <h3 className="font-semibold text-lg">{asset['@id']}</h3>
                {assetDescription && (
                    <p className="text-sm text-muted-foreground mt-1">
                        {assetDescription}
                    </p>
                )}
            </div>

            {assetPolicy && (
                <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Policy ID:</span>
                        <span className="font-mono truncate ml-2 max-w-[200px]">{assetPolicy['@id']}</span>
                    </div>
                </div>
            )}

            <Button
                onClick={onSubscribe}
                disabled={isSubscribing}
                className="w-full"
                size="sm"
            >
                {isSubscribing ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Subscribing...
                    </>
                ) : (
                    'Subscribe & Mint NFT'
                )}
            </Button>
        </div>
    );
};

export default CatalogAssetCard;