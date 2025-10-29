import { Address, Hex } from 'viem';

export interface VerificationRequest {
    correlationId: string;
    signature: Hex;
    message: {
        domain: string;
        address: Address;
        uri: string;
        version: '1';
        chainId: number;
        nonce: string;
        statement?: string;
        issuedAt?: string;
        expirationTime?: string;
    };
}

export interface NFTMetadata {
    agreementId: string;
    assetId: string;
    providerId: string;
    consumerId: string;
    signedAt: bigint;
    expiresAt: bigint;
    isRevoked: boolean;
}

export interface VerificationResponse {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
}

export interface AssetNFTProperties {
    contractAddress: Address;
    chainId: number;
    chainName: string;
    nftRequired: boolean;
}
