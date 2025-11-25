import axios from 'axios';
import { AssetFetchError } from '../errors/edcErrors.js';
import { Asset } from '../types/edc.js';

export class EdcService {
    private readonly baseUrl: string;
    private readonly apiKey: string;

    constructor(baseUrl: string, apiKey: string) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    async getAssets(): Promise<Asset[]> {
        const payload = {
            "@context": {
                "@vocab": "https://w3id.org/edc/v0.0.1/ns/"
            },
            "@type": "QuerySpec"
        };

        try {
            const response = await axios.post(
                `${this.baseUrl}/api/management/v3/assets/request`,
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
            throw new AssetFetchError();
        }
    }
}
