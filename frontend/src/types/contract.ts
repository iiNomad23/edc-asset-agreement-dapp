import { OdrlAgreementPolicy, OdrlPolicy } from '@/types/policy.ts';

export interface ContractNegotiationRequest {
    assetId: string;
    policy: OdrlPolicy;
    counterPartyAddress: string;
    counterPartyId: string;
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
