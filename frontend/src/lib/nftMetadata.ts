import { ContractAgreement } from '@/types/contract';

export interface NFTMetadata {
    name: string;
    description: string;
    external_url: string;
    image: string;
    attributes: Array<{
        trait_type: string;
        value: string | number;
    }>;
}

export function generateAgreementMetadata(
    agreement: ContractAgreement,
    imageUrl: string
): NFTMetadata {
    return {
        name: `EDC Agreement #${agreement['@id'].split(':').pop() || agreement['@id']}`,
        description: `Access token for asset ${agreement.assetId} under negotiated policy.`,
        external_url: `${window.location.origin}/agreements/${agreement['@id']}`,
        image: imageUrl,
        attributes: [
            {
                trait_type: 'Asset ID',
                value: agreement.assetId,
            },
            {
                trait_type: 'Agreement ID',
                value: agreement['@id'],
            },
            {
                trait_type: 'Signed At',
                value: agreement.contractSigningDate,
            },
            {
                trait_type: 'Provider ID',
                value: agreement.providerId,
            },
            {
                trait_type: 'Consumer ID',
                value: agreement.consumerId,
            },
        ],
    };
}

export function metadataToDataURI(metadata: NFTMetadata): string {
    const jsonString = JSON.stringify(metadata);
    const base64 = btoa(jsonString);
    return `data:application/json;base64,${base64}`;
}

export function shortenId(id: string, chars = 4): string {
    if (id.length <= chars * 2 + 3) {
        return id;
    }

    return `${id.substring(0, chars)}...${id.substring(id.length - chars)}`;
}
