import { AppError } from './baseAppError.js';

export class UnsupportedChainError extends AppError {
    public readonly statusCode = 400;
    public override get message(): string {
        return 'Unsupported blockchain chain.';
    }
}

export class CreatePublicClientError extends AppError {
    public readonly statusCode = 500;
    public override get message(): string {
        return 'Failed to create public blockchain client.';
    }
}

export class MetadataFetchError extends AppError {
    public readonly statusCode = 500;
    public override get message(): string {
        return 'Failed to fetch NFT agreement metadata.';
    }
}

export class TokenIdFetchError extends AppError {
    public readonly statusCode = 500;
    public override get message(): string {
        return 'Failed to fetch token id of NFT agreement metadata.';
    }
}

export class OwnerOfTokenIdFetchError extends AppError {
    public readonly statusCode = 500;
    public override get message(): string {
        return 'Failed to fetch owner of token id.';
    }
}

export class NftNotFoundError extends AppError {
    public readonly statusCode = 404;
    public override get message(): string {
        return 'NFT not found for agreement.';
    }
}

export class NftOwnershipVerificationError extends AppError {
    public readonly statusCode = 403;
    public override get message(): string {
        return 'NFT ownership verification failed.';
    }
}

export class NftRevokedAgreementError extends AppError {
    public readonly statusCode = 403;
    public override get message(): string {
        return 'NFT agreement has been revoked.';
    }
}

export class NftExpiredAgreementError extends AppError {
    public readonly statusCode = 403;
    public override get message(): string {
        return 'NFT agreement has expired.';
    }
}