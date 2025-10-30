import React from 'react';
import { FileText, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { CatalogAsset } from '@/types/catalog.ts';

interface CatalogAssetCardProps {
    asset: CatalogAsset;
    isSubscribing: boolean;
    onSubscribe: () => void;
}

const CatalogAssetCard: React.FC<CatalogAssetCardProps> = ({ asset, isSubscribing, onSubscribe }) => {
    const assetDescription = asset.description;
    const assetPolicy = asset['odrl:hasPolicy'];

    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="w-5 h-5 text-blue-500" />
                            {asset['@id']}
                        </CardTitle>
                        {assetDescription && (
                            <CardDescription className="mt-1">
                                {assetDescription}
                            </CardDescription>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col justify-end">
                <div>
                    {assetPolicy && (
                        <div className="space-y-2 text-sm">
                            <div>
                                <p className="text-muted-foreground mb-1">Policy ID</p>
                                <p className="font-mono text-xs break-all">{assetPolicy['@id']}</p>
                            </div>
                        </div>
                    )}
                </div>
                <Button onClick={onSubscribe} disabled={isSubscribing} variant="outline" size="sm" className="w-full">
                    {isSubscribing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Negotiating...
                        </>
                    ) : (
                        <>
                            <FileText className="w-4 h-4 mr-2" />
                            Negotiate contract agreement
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
};

export default CatalogAssetCard;
