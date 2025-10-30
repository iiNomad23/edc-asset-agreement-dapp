import { AppError } from './baseAppError.js';

export class CatalogFetchError extends AppError {
    public readonly statusCode = 502;
    public override get message(): string {
        return 'Failed to fetch catalog from EDC service.';
    }
}
