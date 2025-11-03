import { OdrlPolicy } from './policy.js';
import { Address } from 'viem';

interface AssetDistribution {
    '@type': string;
    'dct:format': {
        '@id': string;
    };
    'dcat:accessService': {
        '@id': string;
        '@type': string;
    };
}

export interface CatalogAsset {
    '@id': string;
    '@type': string;
    description: string;
    id: string;
    chainId?: string;
    chainName?: string;
    contractAddress?: Address;
    'dcat:distribution'?: AssetDistribution[];
    'odrl:hasPolicy'?: OdrlPolicy;
}

interface DataService {
    '@id': string;
    '@type': string;
    'dcat:endpointDescription'?: string;
    'dcat:endpointUrl'?: string;
    'dcat:endpointURL'?: string;
}

interface Catalog {
    '@id': string;
    '@type': string;
    'dcat:dataset'?: CatalogAsset[];
    'dcat:catalog'?: Catalog[];
    'dcat:distribution'?: unknown[];
    'dcat:service'?: DataService;
    'dspace:participantId': string;
}

export interface CatalogEnvelop {
    '@id': string;
    '@type': string;
    'dcat:dataset'?: CatalogAsset | CatalogAsset[];
    'dcat:catalog'?: Catalog[];
    'dcat:distribution'?: unknown[];
    'dcat:service'?: DataService;
    'dspace:participantId': string;
    originator?: string;
    '@context'?: Record<string, unknown>;
}

export interface AssetsResponse {
    totalAssets: number;
    assets: CatalogAsset[];
}

export interface CatalogQueryRequest {
    '@context': string[];
    '@type': string;
}
