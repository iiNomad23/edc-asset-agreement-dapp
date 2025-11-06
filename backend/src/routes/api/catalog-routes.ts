import type { FastifyInstance } from 'fastify';

export default async function catalogRoutes(fastify: FastifyInstance) {
    const { edcService } = fastify;

    fastify.get('/api/catalog/cached', async (_request, _reply) => {
        return await edcService.getCachedCatalog();
    });
}
