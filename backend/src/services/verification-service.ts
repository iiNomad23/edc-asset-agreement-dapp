import { Hex, verifyMessage } from 'viem';
import type { TransferService } from './transfer-service.js';
import type { ContractService } from './contract-service.js';
import type { BlockchainService } from './blockchain-service.js';
import type { EDCService } from './edc-service.js';
import { SiweMessageData, VerificationRequest, VerificationResponse } from '../types/verification.js';
import { createSiweMessage, SiweMessage } from 'viem/siwe';
import { TransferProcess } from '../types/transfer.js';
import { ContractAgreement } from '../types/contract.js';
import { CatalogAsset } from '../types/catalog.js';
import {
    AgreementMismatchError,
    AssetMismatchError,
    ChainIdMismatchError,
    InvalidSignatureError,
    NftAgreementMetadataMismatchError,
    RequiredAssetNftConfigurationNotFoundError,
    SignatureVerificationFailedError,
    TransferMismatchError,
} from '../errors/verificationErrors.js';

export class VerificationService {
    private readonly edcService: EDCService;
    private readonly transferService: TransferService;
    private readonly contractService: ContractService;
    private readonly blockchainService: BlockchainService;

    constructor(
        edcService: EDCService,
        transferService: TransferService,
        contractService: ContractService,
        blockchainService: BlockchainService,
    ) {
        this.edcService = edcService;
        this.transferService = transferService;
        this.contractService = contractService;
        this.blockchainService = blockchainService;
    }

    private async verifySiweMessage(message: SiweMessageData, signature: Hex): Promise<boolean> {
        try {
            const siweMessageParams: SiweMessage = {
                address: message.address,
                chainId: message.chainId,
                domain: message.domain,
                uri: message.uri,
                nonce: message.nonce,
                version: message.version,
            };

            if (message.statement) {
                siweMessageParams.statement = message.statement;
            }
            if (message.issuedAt) {
                siweMessageParams.issuedAt = new Date(message.issuedAt);
            }
            if (message.expirationTime) {
                siweMessageParams.expirationTime = new Date(message.expirationTime);
            }

            const siweMessage = createSiweMessage(siweMessageParams);
            return await verifyMessage({
                address: message.address,
                message: siweMessage,
                signature: signature,
            });
        } catch {
            throw new SignatureVerificationFailedError();
        }
    }

    private async getMatchingTransfer(correlationId: string): Promise<TransferProcess> {
        const transfers = await this.transferService.getTransfers();
        const matchingTransfer = transfers.find(
            transfer => transfer['@id'] === correlationId,
        );

        if (!matchingTransfer) {
            throw new TransferMismatchError();
        }

        return matchingTransfer;
    }

    private async getMatchingAgreement(contractId: string): Promise<ContractAgreement> {
        const agreements = await this.contractService.getAgreements();
        const matchingAgreement = agreements.find(
            agreement => agreement['@id'] === contractId,
        );

        if (!matchingAgreement) {
            throw new AgreementMismatchError();
        }

        return matchingAgreement;
    }

    private async getMatchingAsset(assetId: string): Promise<CatalogAsset> {
        const assets = await this.edcService.getAssets();
        const asset = assets.find(asset => asset.id === assetId);

        if (!asset) {
            throw new AssetMismatchError();
        }

        return asset;
    }

    async verifyDataAccess(request: VerificationRequest): Promise<VerificationResponse> {
        const isValid = await this.verifySiweMessage(request.message, request.signature);
        if (!isValid) {
            throw new InvalidSignatureError();
        }

        const matchingTransfer = await this.getMatchingTransfer(request.correlationId);
        const matchingAgreement = await this.getMatchingAgreement(matchingTransfer.contractId);
        const matchingAsset = await this.getMatchingAsset(matchingTransfer.assetId);

        const contractAddress = matchingAsset.contractAddress;
        const chainId = Number(matchingAsset.chainId);

        if (!contractAddress || !chainId) {
            throw new RequiredAssetNftConfigurationNotFoundError();
        }

        if (request.message.chainId !== chainId) {
            throw new ChainIdMismatchError();
        }

        const ownerAddress = request.message.address;
        const agreementId = matchingAgreement['@id'];

        const nftVerificationResult = await this.blockchainService.verifyNFTAgreement(
            contractAddress,
            ownerAddress,
            chainId,
            agreementId,
        );

        const metadata = nftVerificationResult.metadata;

        if (matchingAsset.agreementExpiresAfter) {
            const agreementExpiresAfterSeconds = BigInt(matchingAsset.agreementExpiresAfter);
            const expectedExpiresAt = metadata.signedAt + agreementExpiresAfterSeconds;

            if (metadata.expiresAt !== expectedExpiresAt) {
                throw new NftAgreementMetadataMismatchError();
            }
        }

        if (metadata.agreementId !== agreementId) {
            throw new NftAgreementMetadataMismatchError();
        }

        if (metadata.assetId !== matchingAgreement.assetId) {
            throw new NftAgreementMetadataMismatchError();
        }

        if (metadata.signedAt !== BigInt(matchingAgreement.contractSigningDate)) {
            throw new NftAgreementMetadataMismatchError();
        }

        if (metadata.providerId !== matchingAgreement.providerId) {
            throw new NftAgreementMetadataMismatchError();
        }

        if (metadata.consumerId !== matchingAgreement.consumerId) {
            throw new NftAgreementMetadataMismatchError();
        }

        return {
            message: 'Verification successful',
            data: {
                contractAddress: contractAddress,
                ownerAddress: ownerAddress,
                chainId: chainId,
                transferId: matchingTransfer['@id'],
                tokenId: nftVerificationResult.tokenId.toString(),
                nftMetadata: {
                    ...nftVerificationResult.metadata,
                    signedAt: nftVerificationResult.metadata.signedAt.toString(),
                    expiresAt: nftVerificationResult.metadata.expiresAt.toString(),
                },
            },
        };
    }
}
