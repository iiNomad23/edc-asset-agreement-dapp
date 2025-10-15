import type { FastifyInstance } from 'fastify';
import type { AssetsResponse, EDCError } from '../../types/index.js';

export default async function assetsRoutes(fastify: FastifyInstance) {
    const { edcService } = fastify;

    fastify.get('/api/assets', async (_request, reply) => {
        try {
            const assets = await edcService.getAssets();

            const response: AssetsResponse = {
                totalAssets: assets.length,
                assets
            };

            return response;
        } catch (error) {
            fastify.log.error(error);

            const errorResponse: EDCError = {
                error: 'Failed to fetch assets',
                message: error instanceof Error ? error.message : 'Unknown error'
            };

            return reply.code(500).send(errorResponse);
        }
    });
}