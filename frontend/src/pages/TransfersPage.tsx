import React, { useState } from 'react';
import { BACKEND_URL } from '@/config/env.ts';
import { useQuery } from '@tanstack/react-query';
import { TransferProcess } from '@/types/transfer.ts';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import DataTransferCard from '@/components/cards/DataTransferCard.tsx';

const TransfersPage: React.FC = () => {
    const [fetchingTransferId, setFetchingTransferId] = useState<string | null>(null);

    const { data: transfers, isLoading } = useQuery({
        queryKey: ['transfers'],
        queryFn: async () => {
            const response = await fetch(`${BACKEND_URL}/api/transfers`);
            if (!response.ok) {
                throw new Error('Failed to fetch transfers');
            }
            return await response.json() as Promise<TransferProcess[]>;
        },
        refetchInterval: 30000,
    });

    const handleFetchData = async (transferId: string) => {
        try {
            setFetchingTransferId(transferId);

            const fetchDataResponse = await fetch(
                `${BACKEND_URL}/api/transfers/${transferId}/fetch-data`,
            );

            if (!fetchDataResponse.ok) {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error('Failed to get data address');
            }

            const data = await fetchDataResponse.json();

            toast.success('Data fetched successfully!', {
                description: 'Check the console for the data',
                duration: 5000,
            });

            console.log('Fetched data:', data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data', {
                description: error instanceof Error ? error.message : 'Unknown error',
            });
        } finally {
            setFetchingTransferId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            <div>
                <h2 className="text-2xl font-bold mb-1">Data Transfers</h2>
                <p className="text-sm text-muted-foreground">
                    View and manage your data transfer processes
                </p>
            </div>

            {transfers && transfers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {transfers.map((transfer) => (
                        <DataTransferCard
                            key={transfer['@id']}
                            transfer={transfer}
                            onFetchData={handleFetchData}
                            isFetching={fetchingTransferId === transfer['@id']}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 border rounded-lg">
                    <p className="text-muted-foreground">No data transfers found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Initiate transfers from the Agreements page
                    </p>
                </div>
            )}
        </div>
    );
};

export default TransfersPage;
