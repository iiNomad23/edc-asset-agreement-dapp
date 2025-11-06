import Fastify from 'fastify';
import cors from '@fastify/cors';
import { API_KEY, CONSUMER_CATALOG_QUERY_URL, CONSUMER_MANAGEMENT_URL, FRONTEND_URL, LOG_LEVEL } from './config/env.js';
import { EDCService } from './services/edc-service.js';
import { ContractService } from './services/contract-service.js';
import healthRoutes from './routes/health-routes.js';
import catalogRoutes from './routes/api/catalog-routes.js';
import assetRoutes from './routes/api/asset-routes.js';
import contractRoutes from './routes/api/contract-routes.js';
import { TransferService } from './services/transfer-service.js';
import transferRoutes from './routes/api/transfer-routes.js';
import { BlockchainService } from './services/blockchain-service.js';
import { VerificationService } from './services/verification-service.js';
import dummyServiceRoutes from './routes/api/external/dummy-service-routes.js';
import { errorHandler } from './middleware/errorHandlerMiddleware.js';

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

    fastify.setErrorHandler(errorHandler);

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

    const blockchainService = new BlockchainService('');
    const verificationService = new VerificationService(
        edcService,
        transferService,
        contractService,
        blockchainService
    );

    fastify.decorate('edcService', edcService);
    fastify.decorate('contractService', contractService);
    fastify.decorate('transferService', transferService);
    fastify.decorate('blockchainService', blockchainService);
    fastify.decorate('verificationService', verificationService);

    await fastify.register(healthRoutes);
    await fastify.register(catalogRoutes);
    await fastify.register(assetRoutes);
    await fastify.register(contractRoutes);
    await fastify.register(transferRoutes);
    await fastify.register(dummyServiceRoutes);

    return fastify;
}

declare module 'fastify' {
    interface FastifyInstance {
        edcService: EDCService;
        contractService: ContractService;
        transferService: TransferService;
        verificationService: VerificationService;
    }
}
