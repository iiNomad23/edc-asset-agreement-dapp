import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../errors/baseAppError.js';
import { ProblemDetails } from '../types/errors.js';

/**
 * RFC 7807 Problem Details for HTTP APIs
 */
function createProblemDetails(error: Error): ProblemDetails {
    const baseUrl = 'https://datatracker.ietf.org/doc/html/rfc9110';

    if (error instanceof AppError) {
        const statusCode = error.statusCode;

        let section: string;
        let title: string;

        switch (statusCode) {
            case 400:
                section = '#section-15.5.1';
                title = 'Bad Request';
                break;
            case 403:
                section = '#section-15.5.4';
                title = 'Forbidden';
                break;
            case 404:
                section = '#section-15.5.5';
                title = 'Not Found';
                break;
            case 500:
                section = '#section-15.6.1';
                title = 'Internal Server Error';
                break;
            case 502:
                section = '#section-15.6.3';
                title = 'Bad Gateway';
                break;
            case 504:
                section = '#section-15.6.5';
                title = 'Gateway Timeout';
                break;
            default:
                section = '';
                title = 'Unknown Error';
        }

        return {
            type: `${baseUrl}${section}`,
            title: title,
            status: statusCode,
            detail: error.message,
        };
    }

    return {
        type: `${baseUrl}/#section-15.6.1`,
        title: 'Internal Server Error',
        status: 500,
        detail: 'Unknown internal server error'
    };
}

export function errorHandler(
    error: FastifyError | Error,
    request: FastifyRequest,
    reply: FastifyReply
) {
    request.log.error({
        err: error,
        url: request.url,
        method: request.method,
    }, 'Request error occurred');

    const problemDetails = createProblemDetails(error);
    return reply
        .code(problemDetails.status)
        .header('Content-Type', 'application/problem+json')
        .send(problemDetails);
}
