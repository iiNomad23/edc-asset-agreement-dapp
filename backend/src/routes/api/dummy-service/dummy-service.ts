import type { FastifyInstance } from 'fastify';
import type { VerificationRequest } from '../../../types/verification.js';
import { constants } from 'http2';

export default async function dummyServiceRoutes(fastify: FastifyInstance) {
    const { verificationService } = fastify;

    fastify.post<{ Body: VerificationRequest }>('/api/dummy-service/fetch-data',
        async (request, reply) => {
            try {
                const { correlationId, signature, message } = request.body;
                if (!correlationId || !signature || !message) {
                    return reply.code(constants.HTTP_STATUS_BAD_REQUEST).send({
                        success: false,
                        message: 'Missing required fields',
                        error: 'correlationId, signature, and message are required',
                    });
                }

                fastify.log.info({
                    correlationId: correlationId,
                    address: message.address,
                    chainId: message.chainId,
                }, 'Verification request received');

                const result = await verificationService.verifyDataAccess({
                    correlationId,
                    signature,
                    message,
                });

                if (!result.success) {
                    fastify.log.warn({
                        correlationId: correlationId,
                        address: message.address,
                        error: result.error,
                    }, result.message);

                    return reply.code(constants.HTTP_STATUS_FORBIDDEN).send(result);
                }

                fastify.log.info({
                    correlationId: correlationId,
                    address: message.address,
                    data: result.data,
                }, result.message);

                // TODO: add fetch of dummy-service data here

                return reply.code(constants.HTTP_STATUS_OK).send([3]);
            } catch (error) {
                fastify.log.error({
                    error: error,
                }, 'Failed to fetch data');

                return reply.code(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
                    success: false,
                    message: 'Internal server error',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        },
    );
}
