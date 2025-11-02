import axios from 'axios';
import { CatalogAsset, CatalogEnvelop, CatalogQueryRequest } from '../types/catalog.js';
import { CatalogFetchError } from '../errors/catalogErrors.js';

export class EDCService {
    private readonly baseUrl: string;
    private readonly apiKey: string;

    constructor(baseUrl: string, apiKey: string) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    async getCachedCatalog(): Promise<CatalogEnvelop[]> {
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
            throw new CatalogFetchError();
        }
    }

    async getAssets(): Promise<CatalogAsset[]> {
        const catalogs = await this.getCachedCatalog();
        const catalogAssets: CatalogAsset[] = [];

        for (const catalog of catalogs) {
            if (!catalog['dcat:catalog']) {
                continue;
            }

            const catalogArray = Array.isArray(catalog['dcat:catalog'])
                ? catalog['dcat:catalog']
                : [catalog['dcat:catalog']];

            for (const catalogItem of catalogArray) {
                const datasets = catalogItem['dcat:dataset'] ?? [];
                for (const catalogAsset of datasets) {
                    catalogAssets.push(catalogAsset);
                }
            }
        }

        return catalogAssets;
    }
}