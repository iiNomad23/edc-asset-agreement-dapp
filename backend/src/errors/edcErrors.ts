import { AppError } from './baseAppError.js';

export class AssetFetchError extends AppError {
    public readonly statusCode = 502;
    public override get message(): string {
        return 'Failed to fetch assets from EDC service.';
    }
}
