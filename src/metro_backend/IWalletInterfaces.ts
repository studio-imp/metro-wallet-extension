import { Avalanche, Buffer, } from "avalanche"
import { EVMAPI } from "avalanche/dist/apis/evm/api";
import { RequestResponseData } from "avalanche/dist/common";
import { BigNumber } from "bignumber.js";
import hdkey from "ethereumjs-wallet/dist/hdkey";
import { BigNumberish, Wallet } from 'ethers';
import { IMetroToken, ITokenCache } from "./tokens";
import { ITransactionHistory } from "./txHistory";



export enum WalletTypes {
    Phrase,
    Ledger,
    Trezor
}

/*-- Settings and cached information about the wallet --*/
export interface IWalletSettings {
    currentAccountIndex: number
    highestAccountIndex: number,
    walletType: WalletTypes
}

//class Account represents a pubkey/privkey/address at a certain derivation path index.
export class Account {
    //mnemonicPhrase: string | undefined;
    //privateKey: string | undefined;
    //masterSeed: string | undefined;
    wallet: Wallet;
    index: number;

    constructor(privateKey: Buffer, index: number) {
        this.wallet = new Wallet(privateKey);
        this.index = index;
        //this.wallet.signTransaction
        //this.wallet = Wallet.createRandom();
    }
}

//interface IWalletState is an interface with the datatypes that represent the entire wallet state.
export interface IWalletState {
    networkID: Number;
    accounts: Account[];
}

//An EVM transaction, will probably move this to its seperate file later...
export interface IUnsignedEVMTransaction {
    chainId?: number,
    nonce?: string,
    to?:  string,
    from?: string,
    value?: string | BigNumberish,
    data?: string,
    gasLimit?: string,
    maxFeePerGas?: string,
    maxPriorityFeePerGas?: string,
    type?: number
}


/**IWalletMethods
 * An interface that contains all the methods for the Metro web wallet. 
 */
export interface IWalletMethods {

    //Basic node details default to test network
    nodeDetails: {
        IP: string,
        PORT: number,
        NETWORK_ID: number,
        CHAIN_ID: number,
        PROTOCOL: string
    }    
    
    avaxAmountAtto: BigNumber;
    avaxAmountWhole: string;
    avaxAmountWholePrecise: string;
    currentWallet: Account;
    cChain: EVMAPI;

    isSearchingTokens: boolean;
    tokensCache: ITokenCache;
    walletSettings: IWalletSettings
    txHistory: ITransactionHistory;
        
    walletData: IWalletState;


    updateAllTokensRec(): Promise<void>;
    updateCurrentTokens(): Promise<void>;
    updateAllTokens(): Promise<void>;
    getCurrentAddress(): string;
    updateAvaxBalance(): Promise<void>;
    updateChainID(chainID: number): void;
    changeAccount(accountIndex: number): void;
    resetTxHistory(): void;

    getNonce(): Promise<RequestResponseData>;
    estimateGasLimit(txObject: IUnsignedEVMTransaction): Promise<RequestResponseData>;
    getPriorityGasPrice(): Promise<RequestResponseData>;
    getBaseFeePrice(): Promise<RequestResponseData>;
    signTransaction(unsignedTx: IUnsignedEVMTransaction): Promise<string>;
    issueRawTransaction(signedTxPayload: string): Promise<RequestResponseData>;

    sendTx(recipentAddress: string, amount: string, maxFee: string, priorityGasFee: string, gasLimit: string, token: IMetroToken | null): Promise<RequestResponseData>
    getGasEstimates(recipentAddress: string, amount: string, token: IMetroToken | null): Promise<any>
    getGasEstimateRaw(rawTxData: IUnsignedEVMTransaction): Promise<any>;

    openTxInExplorer(txHash: string): Promise<void>;

    deleteWallet(): void;
}