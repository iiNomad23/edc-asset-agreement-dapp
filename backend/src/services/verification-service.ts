import { Address, verifyMessage } from 'viem';
import type { TransferService } from './transfer-service.js';
import type { ContractService } from './contract-service.js';
import type { NFTService } from './nft-service.js';
import type { EDCService } from './edc-service.js';
import type { AssetNFTProperties, VerificationRequest, VerificationResponse } from '../types/verification.js';
import { createSiweMessage, SiweMessage } from 'viem/siwe';

export class VerificationService {
    private readonly edcService: EDCService;
    private readonly transferService: TransferService;
    private readonly contractService: ContractService;
    private readonly nftService: NFTService;

    constructor(
        edcService: EDCService,
        transferService: TransferService,
        contractService: ContractService,
        nftService: NFTService,
    ) {
        this.edcService = edcService;
        this.transferService = transferService;
        this.contractService = contractService;
        this.nftService = nftService;
    }

    private async getAssetNFTConfig(assetId: string): Promise<AssetNFTProperties | null> {
        try {
            const assets = await this.edcService.getAssets();
            const asset = assets.find(a => a.id === assetId);
            if (!asset) {
                return null;
            }

            if (!asset.contractAddress || !asset.chainId || !asset.chainName) {
                return null;
            }

            return {
                contractAddress: asset.contractAddress as `0x${string}`,
                chainId: Number(asset.chainId),
                chainName: asset.chainName,
                nftRequired: true,
            };
        } catch (error) {
            throw new Error(
                `Failed to get asset NFT config: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    async verifyDataAccess(request: VerificationRequest): Promise<VerificationResponse> {
        try {
            const siweMessageParams: SiweMessage = {
                domain: request.message.domain,
                address: request.message.address,
                uri: request.message.uri,
                version: request.message.version,
                chainId: request.message.chainId,
                nonce: request.message.nonce,
            };

            if (request.message.statement) {
                siweMessageParams.statement = request.message.statement;
            }
            if (request.message.issuedAt) {
                siweMessageParams.issuedAt = new Date(request.message.issuedAt);
            }
            if (request.message.expirationTime) {
                siweMessageParams.expirationTime = new Date(request.message.expirationTime);
            }

            const siweMessage = createSiweMessage(siweMessageParams);
            const isValid = await verifyMessage({
                address: request.message.address,
                message: siweMessage,
                signature: request.signature,
            });

            if (!isValid) {
                return {
                    success: false,
                    message: 'Signature verification failed',
                    error: 'Invalid signature'
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Signature verification failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }

        const transfers = await this.transferService.getTransfers();
        const matchingTransfer = transfers.find(
            // transfer => transfer['@id'] === request.correlationId,  // TODO: we need to use this after we deploy on the linux server
            transfer => transfer.correlationId === request.correlationId,
        );

        if (!matchingTransfer) {
            return {
                success: false,
                message: 'Transfer process not found',
                error: `No transfer found with correlation ID: ${request.correlationId}`,
            };
        }

        const negotiations = await this.contractService.getNegotiations();
        const matchingNegotiation = negotiations.find(
            negotiation => negotiation.contractAgreementId === matchingTransfer.contractId,
        );

        if (!matchingNegotiation) {
            return {
                success: false,
                message: 'Contract negotiation not found',
                error: `No negotiation found for contract ID: ${matchingTransfer.contractId}`,
            };
        }

        const agreements = await this.contractService.getAgreements();
        const matchingAgreement = agreements.find(
            agreement => agreement['@id'] === matchingTransfer.contractId,
        );

        if (!matchingAgreement) {
            return {
                success: false,
                message: 'Contract agreement not found',
                error: `No agreement found with ID: ${matchingTransfer.contractId}`,
            };
        }

        const assetNFTConfig = await this.getAssetNFTConfig(matchingTransfer.assetId);
        if (!assetNFTConfig) {
            return {
                success: false,
                message: 'Asset NFT configuration not found',
                error: `Asset ${matchingTransfer.assetId} does not have NFT requirements configured`,
            };
        }

        if (request.message.chainId !== assetNFTConfig.chainId) {
            return {
                success: false,
                message: 'Chain ID mismatch',
                error: `Expected chain ${assetNFTConfig.chainId}, got ${request.message.chainId}`,
            };
        }

        try {
            const nftVerification = await this.nftService.verifyNFTOwnership(
                assetNFTConfig.contractAddress,
                request.message.address as Address,
                matchingAgreement['@id'],
                assetNFTConfig.chainId,
            );

            const metadata = nftVerification.metadata;
            if (metadata.assetId !== matchingTransfer.assetId) {
                return {
                    success: false,
                    message: 'NFT asset mismatch',
                    error: `NFT asset ID ${metadata.assetId} does not match transfer asset ${matchingTransfer.assetId}`,
                };
            }

            return {
                success: true,
                message: 'Verification successful',
                data: {
                    address: request.message.address,
                    transferId: matchingTransfer['@id'],
                    contractId: matchingTransfer.contractId,
                    assetId: matchingTransfer.assetId,
                    tokenId: nftVerification.tokenId.toString(),
                    nftMetadata: {
                        ...nftVerification.metadata,
                        signedAt: nftVerification.metadata.signedAt.toString(),
                        expiresAt: nftVerification.metadata.expiresAt.toString(),
                    },
                },
            };
        } catch (error) {
            return {
                success: false,
                message: 'NFT verification failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}
