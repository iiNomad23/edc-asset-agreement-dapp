import { Address, Chain, createPublicClient, http, PublicClient } from 'viem';
import { NftMetadata, NftVerificationResult } from '../types/verification.js';
import { EDC_AGREEMENT_NFT_ABI } from '../config/abis/contractAgreementNFTabi.js';
import { hardhat, mainnet, sepolia } from 'viem/chains';
import {
    CreatePublicClientError,
    MetadataFetchError,
    NftExpiredAgreementError,
    NftNotMintedError,
    NftOwnershipVerificationError,
    NftRevokedAgreementError,
    OwnerOfTokenIdFetchError,
    TokenIdFetchError,
    UnsupportedChainError,
} from '../errors/blockchainErrors.js';

const SUPPORTED_CHAINS: Record<number, Chain> = {
    1: mainnet,
    11155111: sepolia,
    31337: hardhat,
};

export class BlockchainService {
    private readonly rpcUrl: string;

    constructor(rpcUrl: string) {
        this.rpcUrl = rpcUrl;
    }

    private createClient(chainId: number): PublicClient {
        const chain = SUPPORTED_CHAINS[chainId];
        if (!chain) {
            throw new UnsupportedChainError();
        }

        try {
            return createPublicClient({
                chain,
                transport: this.rpcUrl !== '' ? http(this.rpcUrl) : http(),
            });
        } catch {
            throw new CreatePublicClientError();
        }
    }

    private async getAgreementMetadata(
        contractAddress: Address,
        chainId: number,
        tokenId: bigint,
    ): Promise<NftMetadata> {
        const client = this.createClient(chainId);

        try {
            return await client.readContract({
                address: contractAddress,
                abi: EDC_AGREEMENT_NFT_ABI,
                functionName: 'getAgreement',
                args: [tokenId],
            }) as NftMetadata;
        } catch {
            throw new MetadataFetchError();
        }
    }

    private async getTokenByAgreementId(
        contractAddress: Address,
        chainId: number,
        agreementId: string,
    ): Promise<bigint> {
        const client = this.createClient(chainId);

        try {
            return await client.readContract({
                address: contractAddress,
                abi: EDC_AGREEMENT_NFT_ABI,
                functionName: 'agreementIdToTokenId',
                args: [agreementId],
            }) as bigint;
        } catch {
            throw new TokenIdFetchError();
        }
    }

    private async getOwnerOfTokenId(
        contractAddress: Address,
        chainId: number,
        tokenId: bigint,
    ): Promise<Address> {
        const client = this.createClient(chainId);

        try {
            return await client.readContract({
                address: contractAddress,
                abi: EDC_AGREEMENT_NFT_ABI,
                functionName: 'ownerOf',
                args: [tokenId],
            }) as Address;
        } catch {
            throw new OwnerOfTokenIdFetchError();
        }
    }

    async verifyNFTAgreement(
        contractAddress: Address,
        ownerAddress: Address,
        chainId: number,
        agreementId: string,
    ): Promise<NftVerificationResult> {
        const tokenId = await this.getTokenByAgreementId(contractAddress, chainId, agreementId);
        if (tokenId === 0n) {
            throw new NftNotMintedError();
        }

        const actualOwner = await this.getOwnerOfTokenId(contractAddress, chainId, tokenId);
        if (actualOwner.toLowerCase() !== ownerAddress.toLowerCase()) {
            throw new NftOwnershipVerificationError();
        }

        const metadata = await this.getAgreementMetadata(
            contractAddress,
            chainId,
            tokenId,
        );

        if (metadata.isRevoked) {
            throw new NftRevokedAgreementError();
        }

        const now = BigInt(Math.floor(Date.now() / 1000));
        const isExpired = metadata.expiresAt > 0n && metadata.expiresAt < now;

        if (isExpired) {
            throw new NftExpiredAgreementError();
        }

        return {
            tokenId: tokenId,
            metadata: metadata,
        };
    }
}
