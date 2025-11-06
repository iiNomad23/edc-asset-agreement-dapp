import { AppError } from './baseAppError.js';

export class RequiredAssetNftConfigurationNotFoundError extends AppError {
    public readonly statusCode = 404;
    public override get message(): string {
        return 'Required asset NFT configuration not found.';
    }
}

export class InvalidSignatureError extends AppError {
    public readonly statusCode = 403;
    public override get message(): string {
        return 'Invalid signature.';
    }
}

export class SignatureVerificationFailedError extends AppError {
    public readonly statusCode = 403;
    public override get message(): string {
        return 'Signature verification failed.';
    }
}

export class ChainIdMismatchError extends AppError {
    public readonly statusCode = 400;
    public override get message(): string {
        return 'Chain ID does not match.';
    }
}

export class AgreementMismatchError extends AppError {
    public readonly statusCode = 403;
    public override get message(): string {
        return 'Contract agreement does not match.';
    }
}

export class AssetMismatchError extends AppError {
    public readonly statusCode = 403;
    public override get message(): string {
        return 'Asset does not match.';
    }
}

export class TransferMismatchError extends AppError {
    public readonly statusCode = 403;
    public override get message(): string {
        return 'Transfer does not match.';
    }
}

export class NftAgreementMetadataMismatchError extends AppError {
    public readonly statusCode = 403;
    public override get message(): string {
        return 'NFT metadata does not match off chain metadata.';
    }
}
