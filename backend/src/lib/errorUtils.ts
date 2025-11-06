import { AppError } from '../errors/baseAppError.js';
import { ProblemDetails } from '../types/errors.js';

export function createErrorResponse(error: AppError): ProblemDetails {
    const baseUrl = 'https://datatracker.ietf.org/doc/html/rfc9110';
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
