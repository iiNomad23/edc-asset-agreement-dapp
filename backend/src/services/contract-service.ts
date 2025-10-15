import axios, { AxiosError } from 'axios';
import type { ContractNegotiationRequest, ContractNegotiationResponse } from '../types/contract.js';

export class ContractService {
    private readonly baseUrl: string;
    private readonly apiKey: string;

    constructor(baseUrl: string, apiKey: string) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    async initiateNegotiation(request: ContractNegotiationRequest): Promise<ContractNegotiationResponse> {
        const payload = {
            '@context': ['https://w3id.org/edc/connector/management/v0.0.1'],
            '@type': 'ContractRequest',
            counterPartyAddress: request.counterPartyAddress,
            counterPartyId: request.counterPartyId,
            protocol: 'dataspace-protocol-http',
            policy: {
                '@type': request.policy['@type'],
                '@id': request.policy['@id'],
                assigner: request.counterPartyId,
                permission: request.policy['odrl:permission'],
                prohibition: request.policy['odrl:prohibition'],
                obligation: request.policy['odrl:obligation'],
                target: request.assetId
            },
            callbackAddresses: []
        };

        try {
            const response = await axios.post(
                `${this.baseUrl}/api/management/v3/contractnegotiations`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Api-Key': this.apiKey
                    }
                }
            );

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                throw new Error(
                    `Failed to initiate negotiation: ${axiosError.message}. ${
                        axiosError.response?.data ? JSON.stringify(axiosError.response.data) : ''
                    }`
                );
            }
            throw error;
        }
    }

    async getNegotiations(): Promise<ContractNegotiationResponse[]> {
        const payload = {
            '@context': ['https://w3id.org/edc/connector/management/v0.0.1'],
            '@type': 'QuerySpec'
        };

        try {
            const response = await axios.post(
                `${this.baseUrl}/api/management/v3/contractnegotiations/request`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Api-Key': this.apiKey
                    }
                }
            );

            return  response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                throw new Error(
                    `Failed to fetch negotiations: ${axiosError.message}. ${
                        axiosError.response?.data ? JSON.stringify(axiosError.response.data) : ''
                    }`
                );
            }
            throw error;
        }
    }

    async waitForNegotiationFinalized(
        negotiationId: string,
        maxAttempts = 20,
        delayMs = 2000
    ): Promise<ContractNegotiationResponse> {
        for (let i = 0; i < maxAttempts; i++) {
            const negotiations = await this.getNegotiations();
            const negotiation = negotiations.find(n => n['@id'] === negotiationId);
            if (!negotiation) {
                throw new Error(`Negotiation ${negotiationId} not found`);
            }

            if (negotiation.state === 'FINALIZED') {
                if (!negotiation.contractAgreementId) {
                    throw new Error('Negotiation finalized but no contract agreement ID found');
                }
                return negotiation;
            }

            if (negotiation.state === 'TERMINATED' || negotiation.state === 'ERROR') {
                throw new Error(`Negotiation failed with state: ${negotiation.state}\n${negotiation.errorDetail}`);
            }

            await new Promise(resolve => setTimeout(resolve, delayMs));
        }

        throw new Error(`Negotiation did not finalize within ${maxAttempts * delayMs / 1000} seconds`);
    }
}