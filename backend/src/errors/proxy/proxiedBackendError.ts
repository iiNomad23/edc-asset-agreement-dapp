import { ProblemDetails } from '../../types/errors.js';
import { AppError } from '../baseAppError.js';

export class ProxiedBackendError extends AppError {
    public readonly statusCode: number;
    private readonly _detail: string;

    constructor(problemDetails: ProblemDetails) {
        super();
        this._detail = problemDetails.detail;
        this.statusCode = problemDetails.status;
        this.name = problemDetails.title;
    }

    public override get message(): string {
        return this._detail;
    }
}
