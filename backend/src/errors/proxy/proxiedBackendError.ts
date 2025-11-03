import { ProblemDetails } from '../../types/errors.js';
import { AppError } from '../baseAppError.js';

export class ProxiedBackendError extends AppError {
    public readonly statusCode: number;

    constructor(problemDetails: Partial<ProblemDetails>) {
        super(problemDetails.detail ?? 'An error occurred while fetching data, check backend logs for details.');
        this.statusCode = problemDetails.status ?? 500;
    }
}
