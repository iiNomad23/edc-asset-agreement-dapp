import axios, { AxiosError } from 'axios';
import { DataAddress, EndpointDataReference, TransferProcess, TransferProcessRequest } from '../types/transfer.js';
import type { ContractService } from './contract-service.js';
import { Hex } from 'viem';
import { SiweMessage } from 'viem/siwe';

interface FetchDataProps {
    method: string,
    body?: {
        correlationId: string,
        signature: Hex,
        message: SiweMessage,
    }
}

export class TransferService {
    private readonly baseUrl: string;
    private readonly apiKey: string;
    private readonly contractService: ContractService;

    constructor(baseUrl: string, apiKey: string, contractService: ContractService) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.contractService = contractService;
    }

    async initiateTransfer(request: TransferProcessRequest): Promise<TransferProcess> {
        const negotiations = await this.contractService.getNegotiations();
        const negotiation = negotiations.find(
            negotiation => negotiation.contractAgreementId === request.contractId,
        );

        if (!negotiation) {
            throw new Error(`No negotiation found for agreement ${request.contractId}`);
        }

        if (!negotiation.counterPartyAddress) {
            throw new Error(`Negotiation ${negotiation['@id']} has no counterPartyAddress`);
        }

        const payload = {
            '@context': ['https://w3id.org/edc/connector/management/v0.0.1'],
            '@type': 'TransferRequest',
            assetId: request.assetId,
            counterPartyAddress: negotiation.counterPartyAddress,
            connectorId: negotiation.counterPartyId,
            contractId: request.contractId,
            dataDestination: {
                type: 'HttpProxy',
            },
            protocol: 'dataspace-protocol-http',
            transferType: request.transferType ?? 'HttpData-PULL',
        };

        try {
            const response = await axios.post(
                `${this.baseUrl}/api/management/v3/transferprocesses`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Api-Key': this.apiKey,
                    },
                },
            );

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                throw new Error(
                    `Failed to initiate transfer: ${axiosError.message}. ${
                        axiosError.response?.data ? JSON.stringify(axiosError.response.data) : ''
                    }`,
                );
            }
            throw error;
        }
    }

    async waitForTransferStarted(
        transferId: string,
        maxAttempts = 20,
        delayMs = 2000,
    ): Promise<TransferProcess> {
        for (let i = 0; i < maxAttempts; i++) {
            const transfers = await this.getTransfers();
            const transfer = transfers.find(t => t['@id'] === transferId);

            if (!transfer) {
                throw new Error(`Transfer ${transferId} not found`);
            }

            if (transfer.state === 'STARTED') {
                return transfer;
            }

            if (transfer.state === 'TERMINATED' || transfer.state === 'ERROR') {
                throw new Error(`Transfer failed with state: ${transfer.state}\n${transfer.errorDetail ?? ''}`);
            }

            await new Promise(resolve => setTimeout(resolve, delayMs));
        }

        throw new Error(`Transfer did not start within ${maxAttempts * delayMs / 1000} seconds`);
    }

    async getTransfers(): Promise<TransferProcess[]> {
        const payload = {
            '@context': ['https://w3id.org/edc/connector/management/v0.0.1'],
            '@type': 'QuerySpec',
        };

        try {
            const response = await axios.post(
                `${this.baseUrl}/api/management/v3/transferprocesses/request`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Api-Key': this.apiKey,
                    },
                },
            );

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                throw new Error(
                    `Failed to fetch transfers: ${axiosError.message}. ${
                        axiosError.response?.data ? JSON.stringify(axiosError.response.data) : ''
                    }`,
                );
            }
            throw error;
        }
    }

    async getEndpointDataReferences(): Promise<EndpointDataReference[]> {
        const payload = {
            '@context': ['https://w3id.org/edc/connector/management/v0.0.1'],
            '@type': 'QuerySpec',
        };

        try {
            const response = await axios.post(
                `${this.baseUrl}/api/management/v3/edrs/request`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Api-Key': this.apiKey,
                    },
                },
            );

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                throw new Error(
                    `Failed to fetch EDRs: ${axiosError.message}. ${
                        axiosError.response?.data ? JSON.stringify(axiosError.response.data) : ''
                    }`,
                );
            }
            throw error;
        }
    }

    async getDataAddressForEDR(transferProcessId: string): Promise<DataAddress> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/api/management/v3/edrs/${transferProcessId}/dataaddress`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Api-Key': this.apiKey,
                    },
                },
            );

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                throw new Error(
                    `Failed to fetch data address for EDR: ${axiosError.message}. ${
                        axiosError.response?.data ? JSON.stringify(axiosError.response.data) : ''
                    }`,
                );
            }
            throw error;
        }
    }

    async fetchData(endpoint: string, authToken: string, props: FetchDataProps): Promise<unknown> {
        try {
            switch (props.method) {
                case 'GET': {
                    const response = await axios.get(endpoint, {
                        headers: {
                            'Authorization': authToken,
                        },
                    });
                    return response.data;
                }
                case 'POST': {
                    // TODO: use endpoint parameter after deployment
                    const response = await axios.post('http://localhost:8190/api/dummy-service/fetch-data', props.body, {
                        headers: {
                            'Authorization': authToken,
                            'Content-Type': 'application/json',
                        },
                    });
                    return response.data;
                }
                default: {
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error(`Unsupported method: ${props.method}`);
                }
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                throw new Error(
                    `Failed to fetch data: ${axiosError.message}. ${
                        axiosError.response?.data ? JSON.stringify(axiosError.response.data) : ''
                    }`,
                );
            }
            throw error;
        }
    }
}
