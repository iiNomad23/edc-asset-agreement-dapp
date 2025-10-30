import { AppError } from '../baseAppError.js';

export class NegotiationInitiationError extends AppError {
    public readonly statusCode = 502;
    public override get message(): string {
        return 'Failed to initiate contract negotiation.';
    }
}

export class NegotiationFetchError extends AppError {
    public readonly statusCode = 502;
    public override get message(): string {
        return 'Failed to fetch contract negotiations.';
    }
}

export class NegotiationNotFoundError extends AppError {
    public readonly statusCode = 404;
    public override get message(): string {
        return 'Contract negotiation not found.';
    }
}

export class NegotiationTimeoutError extends AppError {
    public readonly statusCode = 504;
    public override get message(): string {
        return 'Contract negotiation did not finalize in time.';
    }
}

export class NegotiationFailedError extends AppError {
    public readonly statusCode = 500;
    public override get message(): string {
        return 'Contract negotiation failed.';
    }
}

export class MissingAgreementIdError extends AppError {
    public readonly statusCode = 500;
    public override get message(): string {
        return 'Negotiation finalized but no contract agreement ID found.';
    }
}

export class MissingCounterPartyAddressError extends AppError {
    public readonly statusCode = 500;
    public override get message(): string {
        return 'Negotiation has no counter party address.';
    }
}

export class AgreementFetchError extends AppError {
    public readonly statusCode = 502;
    public override get message(): string {
        return 'Failed to fetch contract agreements.';
    }
}
