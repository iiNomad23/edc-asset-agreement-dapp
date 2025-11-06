import axios from 'axios';
import type { ContractAgreement, ContractNegotiation, ContractNegotiationRequest } from '../types/contract.js';
import {
    AgreementFetchError,
    MissingAgreementIdError,
    NegotiationFailedError,
    NegotiationFetchError,
    NegotiationInitiationError,
    NegotiationNotFoundError,
    NegotiationTimeoutError,
} from '../errors/contractErrors.js';

export class ContractService {
    private readonly baseUrl: string;
    private readonly apiKey: string;

    constructor(baseUrl: string, apiKey: string) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    async initiateNegotiation(request: ContractNegotiationRequest): Promise<ContractNegotiation> {
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
                target: request.assetId,
            },
            callbackAddresses: [],
        };

        try {
            const response = await axios.post(
                `${this.baseUrl}/api/management/v3/contractnegotiations`,
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
            throw new NegotiationInitiationError();
        }
    }

    async getNegotiations(): Promise<ContractNegotiation[]> {
        const payload = {
            '@context': ['https://w3id.org/edc/connector/management/v0.0.1'],
            '@type': 'QuerySpec',
        };

        try {
            const response = await axios.post(
                `${this.baseUrl}/api/management/v3/contractnegotiations/request`,
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
            throw new NegotiationFetchError();
        }
    }

    async waitForNegotiationFinalized(
        negotiationId: string,
        maxAttempts = 20,
        delayMs = 2000,
    ): Promise<ContractNegotiation> {
        for (let i = 0; i < maxAttempts; i++) {
            const negotiations = await this.getNegotiations();
            const negotiation = negotiations.find(n => n['@id'] === negotiationId);

            if (!negotiation) {
                throw new NegotiationNotFoundError();
            }

            if (negotiation.state === 'FINALIZED') {
                if (!negotiation.contractAgreementId) {
                    throw new MissingAgreementIdError();
                }
                return negotiation;
            }

            if (negotiation.state === 'TERMINATED' || negotiation.state === 'ERROR') {
                throw new NegotiationFailedError();
            }

            await new Promise(resolve => setTimeout(resolve, delayMs));
        }

        throw new NegotiationTimeoutError();
    }

    async getAgreements(): Promise<ContractAgreement[]> {
        const payload = {
            '@context': ['https://w3id.org/edc/connector/management/v0.0.1'],
            '@type': 'QuerySpec',
        };

        try {
            const response = await axios.post(
                `${this.baseUrl}/api/management/v3/contractagreements/request`,
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
            throw new AgreementFetchError();
        }
    }
}
