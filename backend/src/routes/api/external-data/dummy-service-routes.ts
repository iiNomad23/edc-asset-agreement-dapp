import type { FastifyInstance } from 'fastify';
import type { VerificationRequest } from '../../../types/verification.js';
import { constants } from 'http2';

const verificationSchema = {
    body: {
        type: 'object',
        required: ['correlationId', 'signature', 'message'],
        properties: {
            correlationId: { type: 'string' },
            signature: { type: 'string' },
            message: {
                type: 'object',
                required: ['address', 'chainId', 'domain', 'nonce', 'uri'],
                properties: {
                    address: { type: 'string' },
                    chainId: { type: 'number' },
                    domain: { type: 'string' },
                    nonce: { type: 'string' },
                    uri: { type: 'string' },
                },
            },
        },
    },
};

export default async function dummyServiceRoutes(fastify: FastifyInstance) {
    const { verificationService } = fastify;

    fastify.post<{ Body: VerificationRequest }>('/api/dummy-service/fetch-data', {
        schema: verificationSchema,
    }, async (request, reply) => {
        const { correlationId, signature, message } = request.body;

        fastify.log.info({
            correlationId,
            address: message.address,
            chainId: message.chainId,
        }, 'Verification request received');

        const result = await verificationService.verifyDataAccess({
            correlationId,
            signature,
            message,
        });

        fastify.log.info({
            correlationId,
            address: message.address,
            data: result.data,
        }, result.message);

        // TODO: add fetch of dummy-service data here
        return reply.code(constants.HTTP_STATUS_OK).send([3]);
    });
}
