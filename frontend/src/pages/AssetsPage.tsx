import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Loader2 } from 'lucide-react';
import CatalogAssetCard from '@/components/CatalogAssetCard.tsx';
import { CatalogEnvelop } from '@/types';

const AssetsPage = (): React.ReactNode => {
    const { isConnected } = useAccount();
    const [selectedConnector, setSelectedConnector] = useState<string>('');

    const { data: cachedCatalogEnvelop, isLoading } = useQuery({
        queryKey: ['catalog'],
        queryFn: async () => {
            const response = await fetch('http://localhost:8190/api/catalog/cached');
            if (!response.ok) {
                throw new Error('Failed to fetch catalog');
            }
            return await response.json() as Promise<CatalogEnvelop[]>;
        },
        enabled: isConnected,
        refetchInterval: 30000,
    });

    const connectors = useMemo(() => {
        const urls: { url: string; description: string }[] = [];

        cachedCatalogEnvelop?.forEach((envelope) => {
            (envelope['dcat:catalog'] ?? []).forEach((catalog) => {
                const svc = catalog['dcat:service'];
                if (!svc) {
                    return;
                }

                const url = svc['dcat:endpointUrl'] ?? svc['dcat:endpointURL'] ?? 'Unknown endpoint';
                const desc = svc['dcat:endpointDescription'] ?? 'Unknown endpoint description';

                if (url && !urls.some((u) => u.url === url)) {
                    urls.push({ url, description: desc });
                }
            });
        });

        return urls;
    }, [cachedCatalogEnvelop]);

    useEffect(() => {
        if (!selectedConnector && connectors.length > 0) {
            setSelectedConnector(connectors[0].url);
        }
    }, [connectors, selectedConnector]);

    if (!isConnected) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
                    <p className="text-muted-foreground">
                        Please connect your wallet to browse available assets
                    </p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!cachedCatalogEnvelop || cachedCatalogEnvelop.length === 0) {
        return (
            <div className="text-center p-8 border rounded-lg">
                <p className="text-muted-foreground">No assets available</p>
            </div>
        );
    }

    const matchingCatalogs = cachedCatalogEnvelop.flatMap((envelope) =>
        (envelope['dcat:catalog'] ?? []).filter((catalog) => {
            const svc = catalog['dcat:service'];
            if (!svc) {
                return;
            }

            const url = svc['dcat:endpointUrl'] ?? svc['dcat:endpointURL'] ?? 'Unknown endpoint';
            return url === selectedConnector;
        }),
    );

    return (
        <div className="grid gap-6">
            <div>
                <h2 className="text-2xl font-bold mb-1">Available Assets</h2>
                <p className="text-sm text-muted-foreground">
                    Browse and subscribe to dataspace assets
                </p>
            </div>

            <div className="flex items-center gap-3">
                <label htmlFor="connector" className="text-sm font-medium">
                    Select Connector:
                </label>
                <select
                    id="connector"
                    value={selectedConnector}
                    onChange={(e) => setSelectedConnector(e.target.value)}
                    className="border rounded-md p-2 text-sm bg-background"
                >
                    {connectors.map((conn) => (
                        <option key={conn.url} value={conn.url}>
                            {`${conn.description} @ ${conn.url}`}
                        </option>
                    ))}
                </select>
            </div>

            {selectedConnector && matchingCatalogs.length > 0 ? (
                matchingCatalogs.map((catalog) => {
                    const datasets = catalog['dcat:dataset'] ?? [];
                    return (
                        <div key={catalog['@id']} className="space-y-3">
                            {datasets.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {datasets.map((asset) => (
                                        <CatalogAssetCard
                                            key={asset['@id']}
                                            asset={asset}
                                            isSubscribing={false}
                                            onSubscribe={() =>
                                                console.warn(`Subscribing asset ${asset['@id']}`)
                                            }
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground border rounded-lg p-4">
                                    No assets available for this connector.
                                </div>
                            )}
                        </div>
                    );
                })
            ) : (
                <div className="text-center text-muted-foreground mt-4">
                    Please select a connector above to view its assets.
                </div>
            )}
        </div>
    );
};

export default AssetsPage;