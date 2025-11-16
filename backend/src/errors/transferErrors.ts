import { AppError } from './baseAppError.js';

export class TransferInitiationError extends AppError {
    public readonly statusCode = 502;
    public override get message(): string {
        return 'Failed to initiate transfer process.';
    }
}

export class TransferNotFoundError extends AppError {
    public readonly statusCode = 404;
    public override get message(): string {
        return 'Transfer process not found.';
    }
}

export class TransferTimeoutError extends AppError {
    public readonly statusCode = 504;
    public override get message(): string {
        return 'Transfer process did not start in time.';
    }
}

export class TransferFailedError extends AppError {
    public readonly statusCode = 500;
    public override get message(): string {
        return 'Transfer process failed.';
    }
}

export class TransferFetchError extends AppError {
    public readonly statusCode = 502;
    public override get message(): string {
        return 'Failed to fetch transfer processes.';
    }
}

export class DataAddressFetchError extends AppError {
    public readonly statusCode = 502;
    public override get message(): string {
        return 'Failed to fetch data address for EDR.';
    }
}

export class UnsupportedMethodError extends AppError {
    public readonly statusCode = 400;
    public override get message(): string {
        return 'Unsupported HTTP method.';
    }
}

export class DataFetchError extends AppError {
    public readonly statusCode = 502;
    public override get message(): string {
        return 'Failed to fetch data from provider.';
    }
}
