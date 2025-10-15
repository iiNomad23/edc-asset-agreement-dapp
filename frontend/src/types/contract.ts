import { OdrlPolicy } from '@/types/policy.ts';

export interface ContractNegotiationRequest {
    assetId: string;
    policy: OdrlPolicy;
    counterPartyAddress: string;
    counterPartyId: string;
}
