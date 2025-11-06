import axios, { AxiosResponse } from 'axios';
import {
    DataAddress,
    EndpointDataReference,
    ProxiedExternalData,
    TransferProcess,
    TransferProcessRequest,
} from '../types/transfer.js';
import type { ContractService } from './contract-service.js';
import { Hex } from 'viem';
import { SiweMessage } from 'viem/siwe';
import { MissingCounterPartyAddressError, NegotiationNotFoundError } from '../errors/contractErrors.js';
import {
    DataAddressFetchError,
    DataFetchError,
    EdrFetchError,
    TransferFailedError,
    TransferFetchError,
    TransferInitiationError,
    TransferNotFoundError,
    TransferTimeoutError,
    UnsupportedMethodError,
} from '../errors/transferErrors.js';
import { ProxiedExternalError } from '../errors/external/proxiedExternalError.js';

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
            throw new NegotiationNotFoundError();
        }

        if (!negotiation.counterPartyAddress) {
            throw new MissingCounterPartyAddressError();
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
        } catch {
            throw new TransferInitiationError();
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
                throw new TransferNotFoundError();
            }

            if (transfer.state === 'STARTED') {
                return transfer;
            }

            if (transfer.state === 'TERMINATED' || transfer.state === 'ERROR') {
                throw new TransferFailedError();
            }

            await new Promise(resolve => setTimeout(resolve, delayMs));
        }

        throw new TransferTimeoutError();
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
        } catch {
            throw new TransferFetchError();
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
        } catch {
            throw new EdrFetchError();
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
        } catch {
            throw new DataAddressFetchError();
        }
    }

    private validateSuccessResponse(response: AxiosResponse<ProxiedExternalData>): void {
        if (!response.data) {
            return;
        }

        const data = response.data;
        if (data.success || !data.error) {
            return;
        }

        throw new ProxiedExternalError(data.error);
    }

    async fetchData(endpoint: string, authToken: string, props: FetchDataProps): Promise<unknown> {
        switch (props.method) {
            case 'GET': {
                try {
                    const response: AxiosResponse<ProxiedExternalData> = await axios.get(endpoint, {
                        headers: {
                            'Authorization': authToken,
                        },
                    });

                    this.validateSuccessResponse(response);

                    return response.data;
                } catch (error) {
                    if (error instanceof ProxiedExternalError) {
                        throw error;
                    }

                    if (axios.isAxiosError(error) && error.response?.data?.error) {
                        throw new ProxiedExternalError(error.response.data.error);
                    }

                    throw new DataFetchError();
                }
            }
            case 'POST': {
                try {
                    const response = await axios.post(endpoint, props.body, {
                        headers: {
                            'Authorization': authToken,
                            'Content-Type': 'application/json',
                        },
                    });

                    this.validateSuccessResponse(response);

                    return response.data;
                } catch (error) {
                    if (error instanceof ProxiedExternalError) {
                        throw error;
                    }

                    if (axios.isAxiosError(error) && error.response?.data?.error) {
                        throw new ProxiedExternalError(error.response.data.error);
                    }

                    throw new DataFetchError();
                }
            }
            default: {
                throw new UnsupportedMethodError();
            }
        }
    }
}
