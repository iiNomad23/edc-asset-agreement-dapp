import { OdrlAgreementPolicy, OdrlPolicy } from './policy.js';

export interface ContractNegotiationRequest {
    assetId: string;
    policy: OdrlPolicy;
    counterPartyAddress: string;
    counterPartyId: string;
}

export interface ContractNegotiationResponse {
    '@id': string;
    '@type': string;
    state: string;
    createdAt: number;
    errorDetail: string;
    contractAgreementId?: string;
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