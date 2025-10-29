import type { FastifyInstance } from 'fastify';
import { FetchDataRequest, TransferProcessRequest } from '../../types/transfer.js';
import { PROVIDER_QNA_PUBLIC_API } from '../../config/env.js';
import { EDCError } from '../../types/index.js';

interface TransferStatusParams {
    transferId: string;
}

interface FetchDataParams {
    transferProcessId: string;
}

export default async function transferRoutes(fastify: FastifyInstance) {
    const { transferService } = fastify;

    fastify.post<{ Body: TransferProcessRequest }>('/api/transfers/initiate',
        async (request, reply) => {
            try {
                const transferRequest: TransferProcessRequest = request.body;
                return await transferService.initiateTransfer(transferRequest);
            } catch (error) {
                fastify.log.error(error);

                const errorResponse: EDCError = {
                    error: 'Failed to initiate transfer',
                    message: error instanceof Error ? error.message : 'Unknown error',
                };

                return reply.code(500).send(errorResponse);
            }
        },
    );

    fastify.get<{ Params: TransferStatusParams }>('/api/transfers/:transferId/wait',
        async (request, reply) => {
            try {
                const { transferId } = request.params;
                return await transferService.waitForTransferStarted(transferId);
            } catch (error) {
                fastify.log.error(error);

                const errorResponse: EDCError = {
                    error: 'Failed waiting for transfer',
                    message: error instanceof Error ? error.message : 'Unknown error',
                };

                return reply.code(500).send(errorResponse);
            }
        },
    );

    fastify.get('/api/transfers', async (_request, reply) => {
        try {
            return await transferService.getTransfers();
        } catch (error) {
            fastify.log.error(error);

            const errorResponse: EDCError = {
                error: 'Failed to fetch transfers',
                message: error instanceof Error ? error.message : 'Unknown error',
            };

            return reply.code(500).send(errorResponse);
        }
    });

    fastify.get('/api/transfers/edrs', async (_request, reply) => {
        try {
            return await transferService.getEndpointDataReferences();
        } catch (error) {
            fastify.log.error(error);

            const errorResponse: EDCError = {
                error: 'Failed to fetch EDRs',
                message: error instanceof Error ? error.message : 'Unknown error',
            };

            return reply.code(500).send(errorResponse);
        }
    });

    fastify.get<{ Params: FetchDataParams }>('/api/transfers/:transferProcessId/fetch-data',
        async (request, reply) => {
            try {
                const { transferProcessId } = request.params;
                const dataAddressResponse = await transferService.getDataAddressForEDR(transferProcessId);
                return await transferService.fetchData(
                    PROVIDER_QNA_PUBLIC_API,
                    dataAddressResponse.authorization,
                    {
                        method: 'GET',
                    },
                );
            } catch (error) {
                fastify.log.error(error);

                const errorResponse: EDCError = {
                    error: 'Failed to fetch data',
                    message: error instanceof Error ? error.message : 'Unknown error',
                };

                return reply.code(500).send(errorResponse);
            }
        },
    );

    fastify.post<{ Body: FetchDataRequest; }>('/api/transfers/fetch-data',
        async (request, reply) => {
            try {
                const { transferProcessId, correlationId, signature, message } = request.body;
                const dataAddressResponse = await transferService.getDataAddressForEDR(transferProcessId);
                return await transferService.fetchData(
                    PROVIDER_QNA_PUBLIC_API,
                    dataAddressResponse.authorization,
                    {
                        method: 'POST',
                        body: {
                            correlationId: correlationId,
                            signature: signature,
                            message: message,
                        },
                    },
                );
            } catch (error) {
                fastify.log.error(error);

                const errorResponse: EDCError = {
                    error: 'Failed to fetch data',
                    message: error instanceof Error ? error.message : 'Unknown error',
                };

                return reply.code(500).send(errorResponse);
            }
        },
    );
}
