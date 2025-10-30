import { ProblemDetails } from '@/types/errors';
import { ApiError } from '@/errors/apiError.ts';

export async function handleApiError(response: Response): Promise<never> {
    const problemDetails: ProblemDetails = await response.json();
    throw new ApiError(problemDetails);
}
