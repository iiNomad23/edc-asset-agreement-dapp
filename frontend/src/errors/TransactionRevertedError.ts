export class TransactionRevertedError extends Error {
    txHash: string;
    blockNumber: bigint;

    constructor(message: string, txHash: string, blockNumber: bigint) {
        super(message);
        this.name = 'TransactionRevertedError';
        this.txHash = txHash;
        this.blockNumber = blockNumber;
    }
}
