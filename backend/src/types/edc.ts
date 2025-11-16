import { Address } from 'viem';

interface AssetProperties {
    description?: string,
    id?: string,
    chainId?: string,
    contractAddress?: Address,
    chainName?: string,
    agreementExpiresAfter?: string
}

export interface Asset {
    '@id': string;
    '@type': string;
    properties: AssetProperties;
    dataAddress: Record<string, string>;
    '@context': Record<string, string>;
}
