import { Hex } from 'viem';
import { SiweMessage } from 'viem/siwe';

export interface TransferProcessRequest {
    assetId: string;
    contractId: string;
    transferType?: string;
}

export interface TransferProcess {
    '@id': string;
    '@type': string;
    state: string;
    stateTimestamp: number;
    type: string;
    assetId: string;
    contractId: string;
    callbackAddresses: any[];
    correlationId: string;
    errorDetail?: string;
}

export interface EndpointDataReference {
    '@id': string;
    '@type': string;
    assetId: string;
    agreementId: string;
    transferProcessId: string;
    providerId: string;
    createdAt: number;
}

export interface DataAddress {
    '@type': string;
    endpoint: string;
    endpointType: string;
    authType: string;
    authorization: string;
    authCode?: string;
}

export interface FetchDataRequest {
    transferProcessId: string;
    correlationId: string;
    signature: Hex;
    message: SiweMessage;
}
