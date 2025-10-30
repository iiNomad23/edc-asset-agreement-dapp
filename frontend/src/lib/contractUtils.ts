import { usePublicClient } from 'wagmi';
import {
    BaseError,
    ContractFunctionRevertedError,
    EstimateContractGasParameters,
    PublicClient,
    TransactionReceipt,
} from 'viem';
import { TransactionRevertedError } from '@/errors/transactionRevertedError.ts';
import { ETHERSCAN_BASES, GAS_BUFFER_MULTIPLIER, MAX_GAS_LIMIT } from '@/config/constants.ts';
import { ExternalToast } from 'sonner';

export async function estimateGasWithBuffer(publicClient: PublicClient, contractCall: EstimateContractGasParameters): Promise<bigint> {
    const estimatedGas = await publicClient.estimateContractGas(contractCall);
    const estimatedGasWithBuffer = (estimatedGas * GAS_BUFFER_MULTIPLIER) / 100n;
    return estimatedGasWithBuffer > MAX_GAS_LIMIT
        ? MAX_GAS_LIMIT
        : estimatedGasWithBuffer;
}

export function validatePublicClient(
    publicClient: ReturnType<typeof usePublicClient>,
): asserts publicClient is NonNullable<ReturnType<typeof usePublicClient>> {
    if (publicClient) {
        return;
    }

    throw new Error('Blockchain connection not available');
}

export function validateTransactionReceipt(
    receipt: TransactionReceipt,
): asserts receipt is TransactionReceipt & { status: 'success' } {
    if (receipt.status === 'success') {
        return;
    }

    throw new TransactionRevertedError(
        'Transaction reverted. Check Etherscan for details.',
        receipt.transactionHash,
        receipt.blockNumber,
    );
}

export const parseContractError = (error: unknown): string => {
    if (error instanceof BaseError) {
        const revertError = error.walk(err => err instanceof ContractFunctionRevertedError);

        if (revertError instanceof ContractFunctionRevertedError) {
            const errorName = revertError.data?.errorName;

            switch (errorName) {
                // Access Control errors
                case 'AccessControlUnauthorizedAccount':
                    return 'You do not have the permission to mint contract agreements';
                case 'AccessControlBadConfirmation':
                    return 'Access control confirmation failed';

                // ERC721 errors
                case 'ERC721InvalidOwner':
                    return 'Invalid token owner address';
                case 'ERC721NonexistentToken':
                    return 'Token does not exist';
                case 'ERC721IncorrectOwner':
                    return 'Incorrect token owner';
                case 'ERC721InvalidSender':
                    return 'Invalid sender address';
                case 'ERC721InvalidReceiver':
                    return 'Invalid receiver address';
                case 'ERC721InsufficientApproval':
                    return 'Insufficient approval for this operation';
                case 'ERC721InvalidApprover':
                    return 'Invalid approver address';
                case 'ERC721InvalidOperator':
                    return 'Invalid operator address';

                // Custom Agreement errors
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
                case 'AgreementAlreadyExpired':
                    return 'Agreement has already expired';
                case 'InsufficientPayment':
                    return 'Insufficient payment amount';
                case 'NoFundsToWithdraw':
                    return 'No funds available to withdraw';
                case 'TransferFailed':
                    return 'Transfer failed';
                case 'ReentrancyGuardReentrantCall':
                    return 'Reentrant call detected';

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
