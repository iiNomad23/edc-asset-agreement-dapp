import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import CatalogAssetCard from '@/components/CatalogAssetCard.tsx';
import { CatalogEnvelop } from '@/types';
import { ContractNegotiationRequest } from '@/types/contract.ts';
import { OdrlPolicy } from '@/types/policy.ts';
import { toast } from 'sonner';

const AssetsPage = (): React.ReactNode => {
    const [selectedConnector, setSelectedConnector] = useState<string>('');
    const [negotiatingAssetId, setNegotiatingAssetId] = useState<string | null>(null);

    const { data: cachedCatalogEnvelop, isLoading } = useQuery({
        queryKey: ['catalog'],
        queryFn: async () => {
            const response = await fetch('http://localhost:8190/api/catalog/cached');
            if (!response.ok) {
                throw new Error('Failed to fetch catalog');
            }
            return await response.json() as Promise<CatalogEnvelop[]>;
        },
        refetchInterval: 30000,
    });

    const negotiateMutation = useMutation({
        mutationFn: async (request: ContractNegotiationRequest) => {
            const response = await fetch(`http://localhost:8190/api/contracts/negotiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message ?? 'Failed to initiate negotiation');
            }

            return response.json();
        },
        onSuccess: async (data) => {
            try {
                const response = await fetch(
                    `http://localhost:8190/api/contracts/negotiations/${data['@id']}/wait`,
                    { method: 'POST' }
                );

                const result = await response.json();
                if (!response.ok) {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error(result.message);
                }

                toast.success('Contract Negotiated Successfully', {
                    description: `Agreement ID: ${result.contractAgreementId}`,
                    duration: 5000,
                });
            } catch (error) {
                console.error(error);
                toast.error('Negotiation Failed', {
                    description: error instanceof Error ? error.message : 'Negotiation initiated but failed to complete',
                    duration: 5000,
                })
            } finally {
                setNegotiatingAssetId(null);
            }
        },
        onError: (error: Error) => {
            console.error('Negotiation error:', error);
            toast.error('Contract Negotiation Failed', {
                description: error.message,
                duration: 5000,
            });
            setNegotiatingAssetId(null);
        },
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

    const handleSubscribe = (assetId: string, policy: OdrlPolicy, selectedConnectorUrl: string) => {
        if (!cachedCatalogEnvelop) {
            return;
        }

        setNegotiatingAssetId(assetId);

        const selectedConnectorCachedCatalogEnvelop = cachedCatalogEnvelop.find(envelope => {
            const catalogs = envelope['dcat:catalog'];
            if (!catalogs) {
                return false;
            }

            return catalogs.some(catalog => {
                const svc = catalog['dcat:service'];
                if (!svc) {
                    return false;
                }

                return svc['dcat:endpointUrl'] === selectedConnectorUrl || svc['dcat:endpointURL'] === selectedConnectorUrl;
            });
        });

        if (!selectedConnectorCachedCatalogEnvelop) {
            toast.error('Failed to determine participant id of selected connector', {
                duration: 5000,
            });
            setNegotiatingAssetId(null);
            return;
        }

        const participantId = selectedConnectorCachedCatalogEnvelop['dspace:participantId'];
        const request: ContractNegotiationRequest = {
            assetId: assetId,
            policy: policy,
            counterPartyAddress: selectedConnectorUrl,
            counterPartyId: participantId,
        };

        negotiateMutation.mutate(request);
    };

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

    const matchingCatalogs = cachedCatalogEnvelop.flatMap((envelope) => {
        const catalogs = envelope['dcat:catalog'] ?? [];
        return catalogs.filter((catalog) => {
            const svc = catalog['dcat:service'];
            if (!svc) {
                return;
            }

            const url = svc['dcat:endpointUrl'] ?? svc['dcat:endpointURL'] ?? 'Unknown endpoint';
            return url === selectedConnector;
        });
    });

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
                                    {datasets.map((asset) => {
                                        const policy = asset['odrl:hasPolicy'];
                                        const policyId = policy?.['@id'];
                                        const assetId = asset['@id'];
                                        const isNegotiating = negotiatingAssetId === assetId;

                                        return (
                                            <CatalogAssetCard
                                                key={assetId}
                                                asset={asset}
                                                isSubscribing={isNegotiating}
                                                onSubscribe={() => {
                                                    if (policyId) {
                                                        handleSubscribe(assetId, policy, selectedConnector);
                                                    } else {
                                                        toast.error('Asset policy information is missing', {
                                                            duration: 5000,
                                                        });
                                                    }
                                                }}
                                            />
                                        );
                                    })}
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