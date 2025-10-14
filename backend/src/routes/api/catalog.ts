import type { FastifyInstance } from 'fastify';
import type { EDCError } from '../../types/index.js';

export default async function catalogRoutes(fastify: FastifyInstance) {
    const { edcService } = fastify;

    fastify.get('/api/catalog/cached', async (_request, reply) => {
        try {
            return await edcService.getCachedCatalog();
        } catch (error) {
            fastify.log.error(error);

            const errorResponse: EDCError = {
                error: 'Failed to fetch catalog',
                message: error instanceof Error ? error.message : 'Unknown error'
            };

            return reply.code(500).send(errorResponse);
        }
    });
}