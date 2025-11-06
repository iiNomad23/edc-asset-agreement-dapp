import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../errors/baseAppError.js';
import { ProblemDetails } from '../types/errors.js';
import { createErrorResponse } from '../lib/errorUtils.js';

/**
 * RFC 7807 Problem Details for HTTP APIs
 */
function createProblemDetails(error: Error): ProblemDetails {
    if (error instanceof AppError) {
        return createErrorResponse(error);
    }

    return {
        type: 'https://datatracker.ietf.org/doc/html/rfc9110#section-15.6.1',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Unknown internal server error',
    };
}

export function errorHandler(
    error: FastifyError | Error,
    request: FastifyRequest,
    reply: FastifyReply,
) {
    request.log.error({
        err: error,
        url: request.url,
        method: request.method,
    }, 'Request error occurred');

    const problemDetails = createProblemDetails(error);
    return reply
        .code(problemDetails.status)
        .header('Content-Type', 'application/json')
        .send(problemDetails);
}
