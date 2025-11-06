import type { FastifyInstance } from 'fastify';
import type { ContractNegotiationRequest } from '../../types/contract.js';

interface NegotiationStatusParams {
    id: string;
}

const contractNegotiationSchema = {
    body: {
        type: 'object',
        required: ['assetId', 'policy', 'counterPartyAddress', 'counterPartyId'],
        properties: {
            assetId: { type: 'string' },
            policy: { type: 'object' },
            counterPartyAddress: { type: 'string' },
            counterPartyId: { type: 'string' },
        },
    },
};

export default async function contractRoutes(fastify: FastifyInstance) {
    const { contractService } = fastify;

    fastify.post<{ Body: ContractNegotiationRequest }>('/api/contracts/negotiate', {
        schema: contractNegotiationSchema,
    }, async (request, _reply) => {
        const { assetId, policy, counterPartyAddress, counterPartyId } = request.body;

        return await contractService.initiateNegotiation({
            assetId,
            policy,
            counterPartyAddress,
            counterPartyId,
        });
    });

    fastify.get<{ Params: NegotiationStatusParams }>('/api/contracts/negotiations/:id/wait',
        async (request, _reply) => {
            return await contractService.waitForNegotiationFinalized(request.params.id);
        },
    );

    fastify.get('/api/contracts/agreements', async (_request, _reply) => {
        return await contractService.getAgreements();
    });
}
