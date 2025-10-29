import { OdrlPolicy } from './policy.js';

export interface Asset {
    id: string;
    type: string;
    description: string;
    policy: OdrlPolicy;
    distributions: any[];
    chainId?: string;
    chainName?: string;
    contractAddress?: string;
}

export interface AssetsResponse {
    totalAssets: number;
    assets: Asset[];
}

export interface CatalogQueryRequest {
    '@context': string[];
    '@type': string;
}

export interface EDCError {
    error: string;
    message: string;
    details?: any;
}