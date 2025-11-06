import type { FastifyInstance } from 'fastify';
import { FetchDataRequest, TransferProcessRequest } from '../../types/transfer.js';
import { PROVIDER_QNA_PUBLIC_API } from '../../config/env.js';

interface TransferStatusParams {
    transferId: string;
}

interface FetchDataParams {
    transferProcessId: string;
}

const transferProcessSchema = {
    body: {
        type: 'object',
        required: ['assetId', 'contractId'],
        properties: {
            assetId: { type: 'string' },
            contractId: { type: 'string' },
            transferType: { type: 'string' },
        },
    },
};

const fetchDataSchema = {
    body: {
        type: 'object',
        required: ['transferProcessId', 'correlationId', 'signature', 'message'],
        properties: {
            transferProcessId: { type: 'string' },
            correlationId: { type: 'string' },
            signature: { type: 'string' },
            message: { type: 'object' },
        },
    },
};

export default async function transferRoutes(fastify: FastifyInstance) {
    const { transferService } = fastify;

    fastify.post<{ Body: TransferProcessRequest }>('/api/transfers/initiate', {
        schema: transferProcessSchema,
    }, async (request, _reply) => {
        return await transferService.initiateTransfer(request.body);
    });

    fastify.get<{ Params: TransferStatusParams }>('/api/transfers/:transferId/wait',
        async (request, _reply) => {
            return await transferService.waitForTransferStarted(request.params.transferId);
        },
    );

    fastify.get('/api/transfers', async (_request, _reply) => {
        return await transferService.getTransfers();
    });

    fastify.get('/api/transfers/edrs', async (_request, _reply) => {
        return await transferService.getEndpointDataReferences();
    });

    fastify.get<{ Params: FetchDataParams }>('/api/transfers/:transferProcessId/fetch-data',
        async (request, _reply) => {
            const { transferProcessId } = request.params;
            const dataAddressResponse = await transferService.getDataAddressForEDR(transferProcessId);

            return await transferService.fetchData(
                PROVIDER_QNA_PUBLIC_API,
                dataAddressResponse.authorization,
                { method: 'GET' },
            );
        },
    );

    fastify.post<{ Body: FetchDataRequest; }>('/api/transfers/fetch-data', {
        schema: fetchDataSchema,
    }, async (request, _reply) => {
        const { transferProcessId, correlationId, signature, message } = request.body;
        const dataAddressResponse = await transferService.getDataAddressForEDR(transferProcessId);

        return await transferService.fetchData(
            PROVIDER_QNA_PUBLIC_API,
            dataAddressResponse.authorization,
            {
                method: 'POST',
                body: {
                    correlationId,
                    signature,
                    message,
                },
            },
        );
    });
}
