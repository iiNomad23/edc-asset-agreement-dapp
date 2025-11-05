import { OdrlAgreementPolicy, OdrlPolicy } from './policy.js';

export interface ContractNegotiationRequest {
    assetId: string;
    policy: OdrlPolicy;
    counterPartyAddress: string;
    counterPartyId: string;
}

export interface ContractNegotiation {
    '@id': string;
    '@type': string;
    type: string;
    protocol: string;
    state: string;
    counterPartyId: string;
    counterPartyAddress: string;
    callbackAddresses: unknown[];
    createdAt: number;
    contractAgreementId?: string;
    errorDetail?: string;
}

export interface ContractAgreement {
    '@id': string;
    '@type': string;
    assetId: string;
    providerId: string;
    consumerId: string;
    contractSigningDate: number;
    policy: OdrlAgreementPolicy;
}
