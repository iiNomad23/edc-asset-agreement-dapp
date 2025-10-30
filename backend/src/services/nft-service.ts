import { Address, Chain, createPublicClient, http, PublicClient } from 'viem';
import { NFTMetadata } from '../types/verification.js';
import { EDC_AGREEMENT_NFT_ABI } from '../config/abis/contractAgreementNFTabi.js';
import { hardhat, mainnet, sepolia } from 'viem/chains';
import {
    CreatePublicClientError,
    MetadataFetchError,
    NftExpiredAgreementError,
    NftNotFoundError,
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

export class NFTService {
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
        } catch (e) {
            throw new CreatePublicClientError();
        }
    }

    private async getAgreementMetadata(
        contractAddress: Address,
        tokenId: bigint,
        chainId: number,
    ): Promise<NFTMetadata> {
        const client = this.createClient(chainId);

        try {
            return await client.readContract({
                address: contractAddress,
                abi: EDC_AGREEMENT_NFT_ABI,
                functionName: 'getAgreement',
                args: [tokenId],
            }) as NFTMetadata;
        } catch (e) {
            throw new MetadataFetchError();
        }
    }

    private async getTokenByAgreementId(
        contractAddress: Address,
        agreementId: string,
        chainId: number,
    ): Promise<bigint> {
        const client = this.createClient(chainId);

        try {
            return await client.readContract({
                address: contractAddress,
                abi: EDC_AGREEMENT_NFT_ABI,
                functionName: 'agreementIdToTokenId',
                args: [agreementId],
            }) as bigint;
        } catch (e) {
            throw new TokenIdFetchError();
        }
    }

    private async getOwnerOfTokenId(
        contractAddress: Address,
        tokenId: bigint,
        chainId: number,
    ): Promise<Address> {
        const client = this.createClient(chainId);

        try {
            return await client.readContract({
                address: contractAddress,
                abi: EDC_AGREEMENT_NFT_ABI,
                functionName: 'ownerOf',
                args: [tokenId],
            }) as Address;
        } catch (e) {
            throw new OwnerOfTokenIdFetchError();
        }
    }

    async verifyNFTOwnership(
        contractAddress: Address,
        ownerAddress: Address,
        agreementId: string,
        chainId: number,
    ): Promise<{ tokenId: bigint; metadata: NFTMetadata }> {
        const tokenId = await this.getTokenByAgreementId(contractAddress, agreementId, chainId);
        if (tokenId === 0n) {
            throw new NftNotFoundError();
        }

        const actualOwner = await this.getOwnerOfTokenId(contractAddress, tokenId, chainId);
        if (actualOwner.toLowerCase() !== ownerAddress.toLowerCase()) {
            throw new NftOwnershipVerificationError();
        }

        const metadata = await this.getAgreementMetadata(
            contractAddress,
            tokenId,
            chainId,
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