import { handleApiError } from '@/lib/apiUtils';
import { BACKEND_URL } from '@/config/env.ts';
import { useQuery } from '@tanstack/react-query';

export function useAssetsQuery() {
    return useQuery({
        queryKey: ['cached-catalog-assets'],
        queryFn: async () => {
            const response = await fetch(`${BACKEND_URL}/api/catalog/cached-assets`);
            if (!response.ok) {
                await handleApiError(response);
            }
            return await response.json();
        },
        refetchInterval: 30000,
    });
}
