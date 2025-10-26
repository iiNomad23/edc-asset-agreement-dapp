import Fastify from 'fastify';
import cors from '@fastify/cors';
import { API_KEY, CONSUMER_CATALOG_QUERY_URL, CONSUMER_MANAGEMENT_URL, FRONTEND_URL, LOG_LEVEL } from './config/env.js';
import { EDCService } from './services/edc-service.js';
import { ContractService } from './services/contract-service.js';
import healthRoutes from './routes/health.js';
import catalogRoutes from './routes/api/catalog.js';
import assetsRoutes from './routes/api/assets.js';
import contractRoutes from './routes/api/contracts.js';
import { TransferService } from './services/transfer-service.js';
import transferRoutes from './routes/api/transfers.js';

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

    const contractService = new ContractService(
        CONSUMER_MANAGEMENT_URL,
        API_KEY,
    );

    const transferService = new TransferService(
        CONSUMER_MANAGEMENT_URL,
        API_KEY,
        contractService,
    );

    fastify.decorate('edcService', edcService);
    fastify.decorate('contractService', contractService);
    fastify.decorate('transferService', transferService);

    await fastify.register(healthRoutes);
    await fastify.register(catalogRoutes);
    await fastify.register(assetsRoutes);
    await fastify.register(contractRoutes);
    await fastify.register(transferRoutes);

    return fastify;
}

declare module 'fastify' {
    interface FastifyInstance {
        edcService: EDCService;
        contractService: ContractService;
        transferService: TransferService;
    }
}