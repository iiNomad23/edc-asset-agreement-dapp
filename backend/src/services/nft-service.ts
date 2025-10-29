import { Address, Chain, createPublicClient, http, PublicClient } from 'viem';
import { NFTMetadata } from '../types/verification.js';
import { EDC_AGREEMENT_NFT_ABI } from '../config/abis/contractAgreementNFTabi.js';
import { hardhat, mainnet, sepolia } from 'viem/chains';

const SUPPORTED_CHAINS: Record<number, Chain> = {
    1: mainnet,
    11155111: sepolia,
    31337: hardhat,
};

export class NFTService {
    private readonly rpcUrl: string;

    constructor(rpcUrl: string) {
        this.rpcUrl = rpcUrl;
    }

    private createClient(chainId: number): PublicClient {
        const chain = SUPPORTED_CHAINS[chainId];
        if (!chain) {
            throw new Error(
                `Unsupported chain ID: ${chainId}. Supported chains: ${Object.keys(SUPPORTED_CHAINS).join(', ')}`,
            );
        }

        return createPublicClient({
            chain,
            transport: this.rpcUrl !== '' ? http(this.rpcUrl) : http(),
        });
    }

    private async getAgreementMetadata(
        contractAddress: Address,
        tokenId: bigint,
        chainId: number,
    ): Promise<NFTMetadata> {
        const client = this.createClient(chainId);
        const agreement = await client.readContract({
            address: contractAddress,
            abi: EDC_AGREEMENT_NFT_ABI,
            functionName: 'getAgreement',
            args: [tokenId],
        }) as NFTMetadata;

        return {
            agreementId: agreement.agreementId,
            assetId: agreement.assetId,
            signedAt: agreement.signedAt,
            providerId: agreement.providerId,
            consumerId: agreement.consumerId,
            expiresAt: agreement.expiresAt,
            isRevoked: agreement.isRevoked,
        };
    }

    async verifyNFTOwnership(
        contractAddress: Address,
        ownerAddress: Address,
        agreementId: string,
        chainId: number,
    ): Promise<{ tokenId: bigint; metadata: NFTMetadata }> {
        const client = this.createClient(chainId);

        const tokenId = await client.readContract({
            address: contractAddress,
            abi: EDC_AGREEMENT_NFT_ABI,
            functionName: 'agreementIdToTokenId',
            args: [agreementId],
        }) as bigint;

        if (tokenId === 0n) {
            throw new Error(`No NFT found for agreement ID "${agreementId}" in contract ${contractAddress}`);
        }

        const actualOwner = await client.readContract({
            address: contractAddress,
            abi: EDC_AGREEMENT_NFT_ABI,
            functionName: 'ownerOf',
            args: [tokenId],
        }) as Address;

        if (actualOwner.toLowerCase() !== ownerAddress.toLowerCase()) {
            throw new Error(`NFT ownership verification failed: Token ${tokenId} (agreement: ${agreementId}) is owned by ${actualOwner}, not ${ownerAddress}`);
        }

        const metadata = await this.getAgreementMetadata(
            contractAddress,
            tokenId,
            chainId,
        );

        if (metadata.isRevoked) {
            throw new Error(`NFT token ${tokenId} (agreement: ${agreementId}) has been revoked`);
        }

        const now = BigInt(Math.floor(Date.now() / 1000));
        const isExpired = metadata.expiresAt > 0n && metadata.expiresAt < now;

        if (isExpired) {
            const expiryDate = new Date(Number(metadata.expiresAt) * 1000).toISOString();
            throw new Error(`NFT token ${tokenId} (agreement: ${agreementId}) expired at ${expiryDate}`);
        }

        return {
            tokenId: tokenId,
            metadata: metadata,
        };
    }
}