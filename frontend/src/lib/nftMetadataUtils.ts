import { ContractAgreement } from '@/types/contract';

export interface NftMetadata {
    name: string;
    description: string;
    external_url: string;
    image: string;
    attributes: Array<{
        trait_type: string;
        value: string | number;
    }>;
    full_agreement: ContractAgreement;
}

export function generateAgreementMetadata(
    agreement: ContractAgreement,
    imageUrl: string,
): NftMetadata {
    return {
        name: `EDC Agreement #${agreement['@id']}`,
        description: `Access token for asset ${agreement.assetId} under negotiated policy.`,
        external_url: 'https://github.com/eclipse-edc',
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
        full_agreement: agreement,
    };
}

export function metadataToDataURI(metadata: NftMetadata): string {
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
