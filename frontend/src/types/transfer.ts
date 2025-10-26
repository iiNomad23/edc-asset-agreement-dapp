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
    correlationId?: string;
    errorDetail?: string;
}
