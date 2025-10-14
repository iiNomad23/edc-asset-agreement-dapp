import Fastify from 'fastify';
import cors from '@fastify/cors';
import { EDCService } from './services/edc-service.js';
import healthRoutes from './routes/health.js';
import catalogRoutes from './routes/api/catalog.js';
import assetsRoutes from './routes/api/assets.js';
import { API_KEY, CONSUMER_CATALOG_QUERY_URL, FRONTEND_URL, LOG_LEVEL } from './config/env.js';

export async function buildApp() {
    const fastify = Fastify({
        logger: {
            level: LOG_LEVEL,
        },
    });

    await fastify.register(cors, {
        origin: FRONTEND_URL,
        credentials: true,
    });

    const edcService = new EDCService(
        CONSUMER_CATALOG_QUERY_URL,
        API_KEY,
    );

    fastify.decorate('edcService', edcService);

    await fastify.register(healthRoutes);
    await fastify.register(catalogRoutes);
    await fastify.register(assetsRoutes);

    return fastify;
}

declare module 'fastify' {
    interface FastifyInstance {
        edcService: EDCService;
    }
}