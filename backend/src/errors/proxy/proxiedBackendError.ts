import { ProblemDetails } from '../../types/errors.js';
import { AppError } from '../baseAppError.js';

export class ProxiedBackendError extends AppError {
    public readonly statusCode: number;

    constructor(problemDetails: ProblemDetails) {
        super(problemDetails.detail);
        this.statusCode = problemDetails.status;
        this.name = problemDetails.title;
    }
}
