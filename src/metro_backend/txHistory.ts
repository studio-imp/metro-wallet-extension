import { MetroRPC } from "metro_scripts/src/api/metroRPC";

/* --- Note # xavax # we are one @
    txHistory.ts contains interfaces and functions that are used for the transaction history system
    metro has.
*/

export enum TransactionStates {
    PENDING,
    SUCCESS,
    FAILED,
}

export interface  IMetroTransaction {
    txType: string,          // E.x SEND ASSET, or CONTRACT CALL, or MINT.
    txHash: string,          // Hash of the transaction.
    txAmount: string,        // Amount of the asset sent in the transaction.
    assetName: string,       // Name of the asset sent.
    assetSymbol: string,     // Symbol of the asset sent, e.x KLO or AVAX.
    recipentAddress: string, // Recipent address of the transaction.
    transactionDate: string, // Date the tx was sent 
    transactionState: TransactionStates,
}

export interface ITransactionHistory {
    history: {
        accountIndex: number,
        transactions: IMetroTransaction[]
    }
}

export async function addNewTransaction(txToAdd: IMetroTransaction) {
    navigator.serviceWorker.controller?.postMessage({
        method: MetroRPC.ADD_TRANSACTION,
        data: txToAdd,
    });
}