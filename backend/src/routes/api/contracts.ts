import type { FastifyInstance } from 'fastify';
import type { EDCError } from '../../types/index.js';
import type { ContractNegotiationRequest } from '../../types/contract.js';

interface NegotiationStatusParams {
    id: string;
}

export default async function contractRoutes(fastify: FastifyInstance) {
    const { contractService } = fastify;

    fastify.post<{ Body: ContractNegotiationRequest }>('/api/contracts/negotiate', async (request, reply) => {
        try {
            const { assetId, policy, counterPartyAddress, counterPartyId } = request.body;
            if (!assetId || !policy || !counterPartyAddress || !counterPartyId) {
                const errorResponse: EDCError = {
                    error: 'Missing required fields',
                    message: 'assetId, policy, counterPartyAddress, and counterPartyId are required',
                };
                return reply.code(400).send(errorResponse);
            }

            return await contractService.initiateNegotiation({
                assetId: assetId,
                policy: policy,
                counterPartyAddress: counterPartyAddress,
                counterPartyId: counterPartyId,
            });
        } catch (error) {
            fastify.log.error(error);

            const errorResponse: EDCError = {
                error: 'Failed to initiate negotiation',
                message: error instanceof Error ? error.message : 'Unknown error',
            };

            return reply.code(500).send(errorResponse);
        }
    });

    fastify.get('/api/contracts/negotiations', async (_request, reply) => {
        try {
            return await contractService.getNegotiations();
        } catch (error) {
            fastify.log.error(error);

            const errorResponse: EDCError = {
                error: 'Failed to fetch negotiations',
                message: error instanceof Error ? error.message : 'Unknown error',
            };

            return reply.code(500).send(errorResponse);
        }
    });

    fastify.post<{
        Params: NegotiationStatusParams
    }>('/api/contracts/negotiations/:id/wait', async (request, reply) => {
            try {
                return await contractService.waitForNegotiationFinalized(request.params.id);
            } catch (error) {
                fastify.log.error(error);

                const errorResponse: EDCError = {
                    error: 'Failed to wait for negotiation',
                    message: error instanceof Error ? error.message : 'Unknown error',
                };

                return reply.code(500).send(errorResponse);
            }
        },
    );
}