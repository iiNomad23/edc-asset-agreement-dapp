import type { FastifyInstance } from 'fastify';
import type { AssetsResponse } from '../../types/catalog.js';

export default async function catalogRoutes(fastify: FastifyInstance) {
    const { catalogService } = fastify;

    fastify.get('/api/catalog/cached', async (_request, _reply) => {
        return await catalogService.getCachedCatalog();
    });

    fastify.get('/api/catalog/cached-assets', async (_request, _reply) => {
        const assets = await catalogService.getCachedCatalogAssets();

        const response: AssetsResponse = {
            totalAssets: assets.length,
            assets,
        };

        return response;
    });
}
