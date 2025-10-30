import { Address, Hex } from 'viem';

export interface SiweMessageData {
    domain: string;
    address: Address;
    uri: string;
    version: '1';
    chainId: number;
    nonce: string;
    statement?: string;
    issuedAt?: string;
    expirationTime?: string;
}

export interface VerificationRequest {
    correlationId: string;
    signature: Hex;
    message: SiweMessageData;
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
    message: string;
    data: {
        contractAddress: Address,
        ownerAddress: Address,
        chainId: number,
        transferId: string,
        tokenId: string,
        nftMetadata: {
            agreementId: string
            assetId: string
            providerId: string
            consumerId: string
            signedAt: string
            expiresAt: string
            isRevoked: boolean
        }
    };
}
