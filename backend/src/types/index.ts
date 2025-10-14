export interface Asset {
    id: string;
    type: string;
    description: string;
    policy: any;
    distributions: any[];
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