import type { FastifyInstance } from 'fastify';
import type { AssetsResponse, EDCError } from '../../types/index.js';

interface AssetParams {
    id: string;
}

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

    fastify.get<{ Params: AssetParams }>('/api/assets/:id', async (request, reply) => {
        try {
            const asset = await edcService.getAssetById(request.params.id);

            if (!asset) {
                const errorResponse: EDCError = {
                    error: 'Asset not found',
                    message: `No asset found with id: ${request.params.id}`
                };
                return reply.code(404).send(errorResponse);
            }

            return asset;
        } catch (error) {
            fastify.log.error(error);

            const errorResponse: EDCError = {
                error: 'Failed to fetch asset',
                message: error instanceof Error ? error.message : 'Unknown error'
            };

            return reply.code(500).send(errorResponse);
        }
    });
}