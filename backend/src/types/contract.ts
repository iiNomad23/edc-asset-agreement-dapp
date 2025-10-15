import { OdrlPolicy } from './policy.js';

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
