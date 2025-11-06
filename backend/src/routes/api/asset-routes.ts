import type { FastifyInstance } from 'fastify';
import type { AssetsResponse } from '../../types/catalog.js';

export default async function assetRoutes(fastify: FastifyInstance) {
    const { edcService } = fastify;

    fastify.get('/api/assets', async (_request, _reply) => {
        const assets = await edcService.getAssets();

        const response: AssetsResponse = {
            totalAssets: assets.length,
            assets,
        };

        return response;
    });
}
