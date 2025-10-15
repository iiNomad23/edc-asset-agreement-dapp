import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ContractAgreement } from '@/types/contract.ts';
import AgreementCard from '@/components/ContractAgreementCard.tsx';
import { useAccount } from 'wagmi';

const AgreementsPage = (): React.ReactNode => {
    const { isConnected } = useAccount();
    const { data: agreements, isLoading } = useQuery({
        queryKey: ['agreements'],
        queryFn: async () => {
            const response = await fetch('http://localhost:8190/api/contracts/agreements');
            if (!response.ok) {
                throw new Error('Failed to fetch agreements');
            }
            return await response.json() as Promise<ContractAgreement[]>;
        },
        refetchInterval: 30000,
    });

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
                <h2 className="text-2xl font-bold mb-1">Contract Agreements</h2>
                <p className="text-sm text-muted-foreground">
                    View all your finalized contract agreements
                </p>
            </div>

            {agreements && agreements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agreements.map((agreement) => (
                        <AgreementCard
                            key={agreement['@id']}
                            agreement={agreement}
                            isConnected={isConnected}
                            isMinting={false}
                            onMint={() => console.log(agreement)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 border rounded-lg">
                    <p className="text-muted-foreground">No contract agreements found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Negotiate contracts from the Assets page to create agreements
                    </p>
                </div>
            )}
        </div>
    );
};

export default AgreementsPage;
