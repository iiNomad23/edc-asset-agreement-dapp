import { BaseError, ContractFunctionRevertedError } from 'viem';
import { ExternalToast } from 'sonner';
import { TransactionRevertedError } from '@/errors/TransactionRevertedError.ts';
import { ETHERSCAN_BASES } from '@/config/constants.ts';

export const parseContractError = (error: unknown): string => {
    if (error instanceof BaseError) {
        const revertError = error.walk(err => err instanceof ContractFunctionRevertedError);

        if (revertError instanceof ContractFunctionRevertedError) {
            const errorName = revertError.data?.errorName;

            switch (errorName) {
                case 'AgreementAlreadyMinted':
                    return 'This agreement has already been minted as an NFT';
                case 'InvalidRecipientAddress':
                    return 'Invalid recipient address';
                case 'AgreementIdRequired':
                    return 'Agreement ID is required';
                case 'AssetIdRequired':
                    return 'Asset ID is required';
                case 'InvalidSigningTimestamp':
                    return 'Invalid signing timestamp';
                case 'TokenDoesNotExist':
                    return 'Token does not exist';
                case 'NotAuthorizedToRevoke':
                    return 'Not authorized to revoke this agreement';
                case 'AgreementAlreadyRevoked':
                    return 'Agreement is already revoked';
                case 'AgreementNotFound':
                    return 'Agreement not found';
                default:
                    if (revertError.reason) {
                        return revertError.reason;
                    }
            }
        }

        if (error.shortMessage) {
            return error.shortMessage;
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unknown error occurred';
};

export const parseTransactionRevertedErrorData = (error: TransactionRevertedError, chainId: number): ExternalToast => {
    const baseUrl = ETHERSCAN_BASES[chainId];
    const hasExplorer = Boolean(baseUrl);
    const txUrl = `${baseUrl}/tx/${error.txHash}`;

    const toastData = {
        description: `Block: ${error.blockNumber}`,
        duration: 60000,
    };

    if (!hasExplorer) {
        return toastData;
    }

    return {
        ...toastData,
        action: {
            label: 'View on Etherscan',
            onClick: () => window.open(txUrl, '_blank'),
        },
    };
};