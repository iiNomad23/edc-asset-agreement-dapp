import { ProblemDetails } from '@/types/errors';

export class ApiError extends Error {
    public readonly status: number;
    public readonly title: string;
    public readonly type: string;

    constructor(problemDetails: ProblemDetails) {
        super(problemDetails.detail);
        this.name = 'ApiError';
        this.status = problemDetails.status;
        this.title = problemDetails.title;
        this.type = problemDetails.type;
    }
}
