import type { FastifyInstance } from 'fastify';

export default async function healthRoutes(fastify: FastifyInstance) {
    fastify.get('/health', async () => {
        return {
            status: 'ok',
            message: 'Backend is running',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    });
}
