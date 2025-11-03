import axios from 'axios';
import type { FastifyInstance } from 'fastify';
import type { VerificationRequest } from '../../../types/verification.js';
import { DummyServiceData } from '../../../types/dummy-service.js';

const verificationSchema = {
    body: {
        type: 'object',
        required: ['correlationId', 'signature', 'message'],
        properties: {
            correlationId: { type: 'string' },
            signature: { type: 'string' },
            message: {
                type: 'object',
                required: ['address', 'chainId', 'domain', 'uri', 'nonce', 'version'],
                properties: {
                    address: { type: 'string' },
                    chainId: { type: 'number' },
                    domain: { type: 'string' },
                    uri: { type: 'string' },
                    nonce: { type: 'string' },
                    version: { type: 'string' },
                    statement: { type: 'string' },
                    issuedAt: { type: 'string' },
                    expirationTime: { type: 'string' },
                },
            },
        },
    },
};

export default async function dummyServiceRoutes(fastify: FastifyInstance) {
    const { verificationService } = fastify;

    fastify.post<{ Body: VerificationRequest }>('/api/dummy-service/fetch-data', {
        schema: verificationSchema,
    }, async (request, _reply) => {
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

        const dummyServiceResponse = await axios.get<DummyServiceData>(
            'http://provider-dummy-service:8000/api/v1/data',
        );

        fastify.log.info({
            correlationId,
            dataItemCount: dummyServiceResponse.data.length,
        }, 'Successfully fetched data from dummy service');

        return dummyServiceResponse.data;
    });
}
