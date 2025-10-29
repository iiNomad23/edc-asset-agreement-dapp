import axios, { AxiosError } from 'axios';
import type { Asset, CatalogQueryRequest } from '../types/index.js';

export class EDCService {
    private readonly baseUrl: string;
    private readonly apiKey: string;

    constructor(baseUrl: string, apiKey: string) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    async getCachedCatalog(): Promise<any> {
        const payload: CatalogQueryRequest = {
            '@context': ['https://w3id.org/edc/connector/management/v0.0.1'],
            '@type': 'QuerySpec'
        };

        try {
            const response = await axios.post(
                `${this.baseUrl}/api/catalog/v1alpha/catalog/query`,
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
                    `Failed to fetch catalog: ${axiosError.message}. ${
                        axiosError.response?.data ? JSON.stringify(axiosError.response.data) : ''
                    }`
                );
            }
            throw error;
        }
    }

    async getAssets(): Promise<Asset[]> {
        const catalogs = await this.getCachedCatalog();
        const assets: Asset[] = [];

        for (const catalog of catalogs) {
            if (!catalog['dcat:catalog']) {
                continue;
            }

            const catalogArray = Array.isArray(catalog['dcat:catalog'])
                ? catalog['dcat:catalog']
                : [catalog['dcat:catalog']];

            for (const catalogItem of catalogArray) {
                const datasets = catalogItem['dcat:dataset'] ?? [];

                for (const dataset of datasets) {
                    assets.push({
                        ...dataset
                    });
                }
            }
        }

        return assets;
    }
}