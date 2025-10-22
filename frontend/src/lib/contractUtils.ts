import { usePublicClient } from 'wagmi';
import { EstimateContractGasParameters, PublicClient, TransactionReceipt } from 'viem';
import { TransactionRevertedError } from '@/errors/TransactionRevertedError.ts';
import { GAS_BUFFER_MULTIPLIER, MAX_GAS_LIMIT } from '@/config/constants.ts';

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