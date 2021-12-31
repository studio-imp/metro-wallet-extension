import { Avalanche, BinTools, Buffer, } from "avalanche"
import { mnemonicToSeedSync, generateMnemonic } from "bip39";
import { BigNumberish, utils, Wallet } from 'ethers';
import { hdkey } from "ethereumjs-wallet";
import { BigNumber } from 'bignumber.js';
import { EVMAPI } from "avalanche/dist/apis/evm";
import { hexlify } from "@ethersproject/bytes";
import { IMetroToken, IToken, ITokenCache, ITokenList } from "./tokens";
import { addNewTransaction, ITransactionHistory, TransactionStates, IMetroTransaction} from "./txHistory";
import { RequestResponseData } from "avalanche/dist/common";
import { MetroRPC } from "metro_scripts/src/api/metroRPC";
//import Wallet from 'ethereumjs-wallet';

/* --- Note # xavax # we are one @
    walletState.ts contains interfaces & classes that contain important information about the wallet.
    This entire file is just a hacky "implementation", will be polished and finessed later, most of the
    shit here will be changed entirely and swapped out for WASM...
*/




//const tools = BinTools.getInstance();

/*-- Settings and cached information about the wallet --*/
export interface IWalletSettings {
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
    avalanche: Avalanche; // Avalanche, we have this for AVM purposes, for now use ethers.js for C-chain (EVM) as its better.
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

//Much like I mentioned in the note above, this entire thing is a temporary solution. Will likely create some sort of singleton
//and split this file into more classes n things, read the docs/roadmap...
//class WalletState contains information about the wallet state, and allows for sending/signing/getting info.
export class WalletState {



    //Basic node details default to test network
    public nodeDetails = {
        IP: 'api.avax-test.network',
        PORT: 443,
        NETWORK_ID: 1,
        CHAIN_ID: 43113,
        PROTOCOL: 'https'
    }

    
    public avaxAmountAtto: BigNumber = new BigNumber("0");
    public avaxAmountWhole: string = "Loading...";
    public avaxAmountWholePrecise: string = '';

    public currentWallet: Account;
    private cChain: EVMAPI;

    public isSearchingTokens: boolean = false; //Are we currently searching if the address has tokens in the token list?

    public tokensCache: ITokenCache = {
        hasSearchedAllTokens: false,
        tokenVault: [{
            address: "",
            tokens: []
        }]
    };

    public walletSettings: IWalletSettings = {
    }

    public txHistory: ITransactionHistory;
    

    //wallet = this.hdWallet.derivePath(this.derivation_path + 0).getWallet();
    walletData: IWalletState = {
        networkID: 1,
        avalanche: new Avalanche(this.nodeDetails.IP, this.nodeDetails.PORT, this.nodeDetails.PROTOCOL, this.nodeDetails.NETWORK_ID),
        accounts: [],
    };
        
    constructor(mnemonicPhrase: string | null) {
        if(localStorage.getItem("NetworkSettings")) {
            this.nodeDetails = JSON.parse(localStorage.getItem("NetworkSettings") || "{}");
        }else {
            localStorage.setItem("NetworkSettings", JSON.stringify(this.nodeDetails));
        }
        this.walletData.avalanche = new Avalanche(this.nodeDetails.IP, this.nodeDetails.PORT, this.nodeDetails.PROTOCOL, this.nodeDetails.NETWORK_ID);

        localStorage.setItem("NetworkSettings", JSON.stringify(this.nodeDetails));

        let phrase = mnemonicPhrase == null ? generateMnemonic(256) : mnemonicPhrase;

        let hdWallet = hdkey.fromMasterSeed(mnemonicToSeedSync(phrase));
        let tmpWallet = hdWallet.derivePath("m/44'/60'/0'/0/" + 0).getWallet();
        this.walletData.accounts.push(new Account(Buffer.from(tmpWallet.getPrivateKey()), 0));

        this.currentWallet = this.walletData.accounts[0];
        this.cChain = this.walletData.avalanche.CChain();

        if(localStorage.getItem("WalletSettings") != null) {
            this.walletSettings = JSON.parse(localStorage.getItem("WalletSettings") || "{}");
        }else {
            this.walletSettings = {
            }
        }

        //localStorage.removeItem("TokenCache");  //debug purposes...
        if(localStorage.getItem("TokenCache" + this.nodeDetails.CHAIN_ID) != null) {
            this.tokensCache = JSON.parse(localStorage.getItem("TokenCache" + this.nodeDetails.CHAIN_ID) || "{}"); 
            if(this.tokensCache.hasSearchedAllTokens == true && this.tokensCache.tokenVault[0].tokens.length > 0) {
                this.updateCurrentTokens();
            }else if (this.tokensCache.hasSearchedAllTokens == false){
                this.isSearchingTokens = true;
                this.updateAllTokens();
            }
        }else {
            this.isSearchingTokens = true;
            this.updateAllTokens();
        }
        if(localStorage.getItem("TransactionHistory" + this.nodeDetails.CHAIN_ID)) {
            this.txHistory = JSON.parse(localStorage.getItem("TransactionHistory" + this.nodeDetails.CHAIN_ID) || '{}');
        }else {
            this.txHistory = {
                history: {
                    accountIndex: this.currentWallet.index,
                    transactions: []
                }
            }
            localStorage.setItem("TransactionHistory" + this.nodeDetails.CHAIN_ID, JSON.stringify(this.txHistory));
        }

        navigator.serviceWorker.onmessage = (event) => {
            if(event.data) {
                if(event.data.method == MetroRPC.GET_SUCCESFUL_TRANSACTIONS){
                    let newTx = event.data.data.txs as IMetroTransaction[];
                    let newHistory = this.txHistory;
                    for(let i = 0; i < newTx.length; i++) {
                        newHistory.history.transactions.unshift(newTx[i]);
                    }

                    this.txHistory = newHistory;
                    localStorage.setItem("TransactionHistory" + this.nodeDetails.CHAIN_ID, JSON.stringify(newHistory));

                    navigator.serviceWorker.controller?.postMessage({
                        method: MetroRPC.CLEAR_PENDING_TRANSACTIONS
                    });
                }
            }
        }
        navigator.serviceWorker.controller?.postMessage({
            method: MetroRPC.GET_SUCCESFUL_TRANSACTIONS
        });

        this.updateAllTokensRec();
    }

    //Updates all added tokens every 5 seconds. TODO: move this to use the hard_working_metro_worker.js service-worker.
    //This is temporary.
    public async updateAllTokensRec() {
        setInterval(async () => {
            let currentTokensList: ITokenCache = JSON.parse(localStorage.getItem("TokenCache" + this.nodeDetails.CHAIN_ID) || "{}");
            this.updateAvaxBalance();
            for(let i = 0; i < currentTokensList.tokenVault[0].tokens.length; i++) {

                let tx = {
                    /*getBalance()*/               /*Padding*/          /*Address we want the balance of*/
                    "data": "0x70a08231" + "000000000000000000000000" + this.getCurrentAddress().slice(2),
                    "to": currentTokensList.tokenVault[0].tokens[i].tokenAddress,
                }
                let response = await this.cChain.callMethod("eth_call", [tx, "latest"], "ext/bc/C/rpc").then((response)=>{
                    return response;
                }).catch((error)=> {
                    i++;
                    console.error("uwu: " + error);
                    return error;
                });

                let divNum = new BigNumber(10).pow(new BigNumber(Number(currentTokensList.tokenVault[0].tokens[i].tokenDecimals))).precision(6);
                
                let amount: number = new BigNumber(String(response.data['result'])).div(divNum).precision(6).toNumber();
                //Add a token to the cache only if the balance is more than 0.
                currentTokensList.tokenVault[0].tokens[i].tokenBalance = amount;

                localStorage.setItem("TokenCache" + this.nodeDetails.CHAIN_ID, JSON.stringify(currentTokensList));
            }
            this.tokensCache = JSON.parse(localStorage.getItem("TokenCache" + this.nodeDetails.CHAIN_ID) || "{}");
        }, 3000);
    }

    //Checks balance of the Current tokens that the wallet already has an amount (> 0) of.
    public async updateCurrentTokens() {
        console.log("Updating balance of current tokens.");
        let currentTokensList: ITokenCache = JSON.parse(localStorage.getItem("TokenCache" + this.nodeDetails.CHAIN_ID) || "{}");

        let i: number = 0;
        let getTokenBalance = async () => {
            setTimeout(async () => {
                //An eth_call that calls the getBalance in ERC20 contracts.
                let tx = {
                    /*getBalance()*/               /*Padding*/          /*Address we want the balance of*/
                    "data": "0x70a08231" + "000000000000000000000000" + this.getCurrentAddress().slice(2),
                    "to": currentTokensList.tokenVault[0].tokens[i].tokenAddress,
                }
                let response = await this.cChain.callMethod("eth_call", [tx, "latest"], "ext/bc/C/rpc").then((response)=>{
                    return response;
                }).catch((error)=> {
                    i++;
                    console.log("uwu: " + error);
                    getTokenBalance();
                    return {
                        "data": error
                    }
                });
                
                let divNum = new BigNumber(10).pow(new BigNumber(Number(currentTokensList.tokenVault[0].tokens[i].tokenDecimals))).precision(6);
                
                //console.log(new BigNumber(String(response.data['result'])).div(divNum).precision(6)
                // + " amount in " + tokenList.tokens[i].name);
                let amount: number = new BigNumber(String(response.data['result'])).div(divNum).precision(6).toNumber();
                //Add a token to the cache only if the balance is more than 0.
                currentTokensList.tokenVault[0].tokens[i].tokenBalance = amount;
                console.log("Updating Token: " + currentTokensList.tokenVault[0].tokens[i].tokenName + " to " +
                 currentTokensList.tokenVault[0].tokens[i].tokenBalance);

                localStorage.setItem("TokenCache" + this.nodeDetails.CHAIN_ID, JSON.stringify(currentTokensList));

                i++;
                if(i < currentTokensList.tokenVault[0].tokens.length) {
                    getTokenBalance();
                }
            }, 100)
        };
        if(i < currentTokensList.tokenVault[0].tokens.length) {
            getTokenBalance();
        }
    }

    //Checks balance of the current address with the Metro Token list & manually added tokens.
    public async updateAllTokens() {
        console.log("Starting token list search...");
        let tokenList: ITokenList = require("../MetroTokenList.json");
        this.tokensCache = {
            hasSearchedAllTokens: false,
            tokenVault: [{
                address: this.getCurrentAddress(),
                tokens: []
            }],
        };
        let i: number = 0;
        let getTokenBalance = async () => {
            setTimeout(async () => {
                //An eth_call that calls the getBalance in ERC20 contracts.
                let tx = {
                    /*getBalance()*/               /*Padding*/          /*Address we want the balance of*/
                    "data": "0x70a08231" + "000000000000000000000000" + this.getCurrentAddress().slice(2),
                    "to": tokenList.tokens[i].address
                }
                let response = await this.cChain.callMethod("eth_call", [tx, "latest"], "ext/bc/C/rpc").then((response)=>{
                    return response;
                }).catch((error)=> {
                    i++;
                    console.log("uwu an error has occurred: " + error);
                    return {
                        "data": error
                    }
                });
                
                let divNum = new BigNumber(10).pow(new BigNumber(Number(tokenList.tokens[i].decimals))).precision(6);
                
                //console.log(new BigNumber(String(response.data['result'])).div(divNum).precision(6)
                // + " amount in " + tokenList.tokens[i].name);
                let amount: number = new BigNumber(String(response.data['result'])).div(divNum).precision(6).toNumber();
                //Add a token to the cache only if the balance is more than 0.
                if(amount > 0.0) {
                    this.tokensCache?.tokenVault[0].tokens.push({
                        tokenName: tokenList.tokens[i].name,
                        tokenAddress: tokenList.tokens[i].address,
                        tokenBalance: amount,
                        tokenDecimals: tokenList.tokens[i].decimals,
                        tokenSymbol: tokenList.tokens[i].symbol,
                        tokenLogoURI: tokenList.tokens[i].logoURI
                    });
                    console.log("Discovered token from Metro token list + User Defined Tokens: " + tokenList.tokens[i].name);
                }
                localStorage.setItem("TokenCache" + this.nodeDetails.CHAIN_ID, JSON.stringify(this.tokensCache));
                console.log("Searched for: " + tokenList.tokens[i].name);
                i++;
                if(i < tokenList.tokens.length) {
                    getTokenBalance();
                }else {
                    this.tokensCache.hasSearchedAllTokens = true;
                    localStorage.setItem("TokenCache" + this.nodeDetails.CHAIN_ID, JSON.stringify(this.tokensCache));
                    this.isSearchingTokens = false;
                }
            }, 100)
        };
        getTokenBalance();

    }
    //Returns the current address the wallet is focused at.    
    public getCurrentAddress(): string {
        //Replace the current account with this latest actual current account...
        return this.currentWallet.wallet.address;
    }
    

    //Gets the latest Avax balance.
    public async updateAvaxBalance() {
        let v =  await this.cChain.callMethod("eth_getBalance",[this.currentWallet.wallet.address, "latest"], "ext/bc/C/rpc");
        this.avaxAmountAtto = new BigNumber(String(v.data['result']));
        this.avaxAmountWhole = String(this.avaxAmountAtto.div(new BigNumber("1000000000000000000")).toNumber().toPrecision(5));
        this.avaxAmountWholePrecise = String(this.avaxAmountAtto.div(new BigNumber("1000000000000000000")).toNumber().toPrecision(18));


    }

    public updateChainID(chainID: number) {
        switch(chainID) {
            case 43113 : {
                this.nodeDetails.CHAIN_ID = 43113;
                this.nodeDetails.IP = "api.avax-test.network";
                break;   
            }
            case 43114 : {
                this.nodeDetails.CHAIN_ID = 43114;
                this.nodeDetails.IP = "api.avax.network";
                break;
            }
            default : {
                this.nodeDetails.CHAIN_ID = 43114;
                this.nodeDetails.IP = "api.avax.network";
                console.error("Custom Chain IDs are coming in the near future! Resolving to main-net...");
            }
        }
        this.walletData.avalanche = new Avalanche(this.nodeDetails.IP, this.nodeDetails.PORT, this.nodeDetails.PROTOCOL, this.nodeDetails.NETWORK_ID);
        this.cChain = this.walletData.avalanche.CChain();
        localStorage.setItem("NetworkSettings", JSON.stringify(this.nodeDetails));

        if(localStorage.getItem("TransactionHistory" + this.nodeDetails.CHAIN_ID)) {
            this.txHistory = JSON.parse(localStorage.getItem("TransactionHistory" + this.nodeDetails.CHAIN_ID) || '{}');
        }else {
            this.txHistory = {
                history: {
                    accountIndex: this.currentWallet.index,
                    transactions: []
                }
            }
            localStorage.setItem("TransactionHistory" + this.nodeDetails.CHAIN_ID, JSON.stringify(this.txHistory));
        }
    }
    public resetTxHistory() {
        this.txHistory = {
            history: {
                accountIndex: this.currentWallet.index,
                transactions: [],
            }
        }
        localStorage.removeItem("TransactionHistory" + this.nodeDetails.CHAIN_ID);
    }


    /* --- A bunch of contract/ethRPC Methods, will move this out to a seperate API later... ---*/

    public async getNonce(): Promise<RequestResponseData> {
        return this.cChain.callMethod("eth_getTransactionCount", [this.getCurrentAddress(), "latest"], "ext/bc/C/rpc");
    }
    public async estimateGasLimit(txObject: IUnsignedEVMTransaction): Promise<RequestResponseData> {
        return this.cChain.callMethod("eth_estimateGas", [txObject], "ext/bc/C/rpc");
    }
    public async getPriorityGasPrice(): Promise<RequestResponseData> {
        return this.cChain.callMethod("eth_maxPriorityFeePerGas", [], "ext/bc/C/rpc");
    }
    public async getBaseFeePrice(): Promise<RequestResponseData> {
        return this.cChain.callMethod("eth_baseFee", [], "ext/bc/C/rpc");
    }
    public async signTransaction(unsignedTx: IUnsignedEVMTransaction): Promise<string> {
        return this.currentWallet.wallet.signTransaction(unsignedTx);
    }
    public async issueRawTransaction(signedTxPayload: string): Promise<RequestResponseData> {
        return this.cChain.callMethod("eth_sendRawTransaction", [signedTxPayload], "ext/bc/C/rpc");
    }

    /**Sends a transaction automatically with the given parameters, returns the tx hash...
     * (eth-call result)
     * 
     */
    public async sendTx(recipentAddress: string, amount: string, maxFee: string, priorityGasFee: string, gasLimit: string, token: IMetroToken | null) {
        let tx: IUnsignedEVMTransaction;
        let terx: IMetroTransaction;
        const today = new Date();

        let dateString =
        today.getFullYear().toString() + " / " +
        (today.getMonth() + 1).toString() + " / "  + 
        today.getDate().toString() + " / " +
        today.getHours().toString() + ":" +
        today.getMinutes().toString().padStart(2, '0');

        if(token == null) { //Normal AVAX transfer
            tx = {
                chainId: this.nodeDetails.CHAIN_ID,
                to:  recipentAddress,
                from: this.getCurrentAddress(),
                value: Number(amount) > 0 ? '0x' + new BigNumber(amount).times("1000000000000000000").toString(16) : '0x',
                nonce: (await this.getNonce()).data.result,
                gasLimit: gasLimit,
                maxPriorityFeePerGas: priorityGasFee,
                maxFeePerGas: maxFee,
                type: 2,
            };
            terx  = {
                txType: "SEND ASSET",
                txHash: "",
                txAmount: amount,
                assetName: "AVAX",
                assetSymbol: "AVAX",
                transactionDate: dateString,
                recipentAddress: recipentAddress,
                transactionState: TransactionStates.PENDING
            }

        } else { //Transfer ERC20 token
             //I know, very computationally heavy way of doing this, idc for now, most of the code is temporary...
             let tokenDecimals = parseInt((await getTokenDecimals(token.tokenAddress)).data.result, 16);
             let amountToSend = new BigNumber(amount).times(new BigNumber('10').pow(tokenDecimals)).toString(16).padStart(64, '0');
         
                                /*transfer()*/        /* Padding */              /* Address */
             let data: string = '0xa9059cbb' + '000000000000000000000000' + recipentAddress.slice(2) + amountToSend;
             tx = {
                chainId: this.nodeDetails.CHAIN_ID,
                to:  token.tokenAddress,
                from: this.getCurrentAddress(),
                nonce: (await this.getNonce()).data.result,
                data: data,
                gasLimit: gasLimit,
                maxFeePerGas: maxFee,
                maxPriorityFeePerGas: priorityGasFee,
                type: 2,
            }

            terx  = {
                txType: "SEND ASSET",
                txHash: "",
                txAmount: amount,
                assetName: token.tokenName,
                assetSymbol: token.tokenSymbol,
                transactionDate: dateString,
                recipentAddress: recipentAddress,
                transactionState: TransactionStates.PENDING,
            }
        }

        let signedTx = await this.signTransaction(tx);
        let res = this.cChain.callMethod("eth_sendRawTransaction", [signedTx], "ext/bc/C/rpc");
        res.then((response) => {
            terx.txHash = response.data.result;
            addNewTransaction(terx);
        })
        return res;
        //return this.cChain.callMethod("eth_sendRawTransaction", [signedTx], "ext/bc/C/rpc");
    }

    /**
    * Returns a promise containing: Unsigned tx as well as recommended gas costs
    * @param address The address to send to
    * @param token Optionally an ERC20 token transfer, keep as null if just a normal transfer.
    */
    public async getGasEstimates(recipentAddress: string, amount: string, token: IMetroToken | null) {

       let tx: IUnsignedEVMTransaction;
       if(token == null) { //Normal AVAX transfer
           tx = {
               //chainId: 43113,
               to:  recipentAddress,
               from: this.getCurrentAddress(),
               value: Number(amount) > 0 ? '0x' + new BigNumber(amount).times("1000000000000000000").toString(16) : '0x',
               nonce: (await this.getNonce()).data.result,
               data: '0x',
           }
       } else { //Transfer ERC20 token
        console.log("sending token");
            //I know, very computationally heavy way of doing this, idc for now, most of the code is temporary...
            let tokenDecimals = parseInt((await getTokenDecimals(token.tokenAddress)).data.result, 16);
            let amountToSend = new BigNumber(amount).times(new BigNumber('10').pow(tokenDecimals)).toString(16).padStart(64, '0');
        
                               /*transfer()*/        /* Padding */              /* Address */
            let data: string = '0xa9059cbb' + '000000000000000000000000' + recipentAddress.slice(2) + amountToSend;
            tx = {
               //chainId: 43113,
               to:  token.tokenAddress,
               from: this.getCurrentAddress(),
               nonce: (await this.getNonce()).data.result,
               data: data,
           }
       }
        return {
            gasLimit: (await this.estimateGasLimit(tx)).data.result,
            baseFee: (await this.getBaseFeePrice()).data.result,
            priorityFee: (await this.getPriorityGasPrice()).data.result,
        }
    }

    /**
    * Returns gas estimates for a raw transaction.
    * @param rawTxData Non-RLP encoded unsigned transaction.
    */
    public async getGasEstimateRaw(rawTxData: IUnsignedEVMTransaction) {
        return {
            gasLimit: (await this.estimateGasLimit(rawTxData)).data.result,
            baseFee: (await this.getBaseFeePrice()).data.result,
            priorityFee: (await this.getPriorityGasPrice()).data.result,
        }
    }

    public async openTxInExplorer(txHash: string) {
        if(this.nodeDetails.CHAIN_ID == 43113) {
            window.open('https://testnet.snowtrace.io/tx/' + txHash, '_blank')?.focus();

        }else if(this.nodeDetails.CHAIN_ID == 43114) {
            window.open('https://snowtrace.io/tx/' + txHash, '_blank')?.focus();
        }
    }
}

/* Misc functions that don't depend on the wallet address*/
/**Retruns the token Name of the given token address, if it exists...
 */
export async function getTokenName(tokenAddress: string): Promise<RequestResponseData> {

    let nodeDetails= {
        IP: 'api.avax-test.network',
        PORT: 443,
        NETWORK_ID: 1,
        CHAIN_ID: 43113,
        PROTOCOL: 'https'
    };
    if(localStorage.getItem("NetworkSettings")) {
        nodeDetails = JSON.parse(localStorage.getItem("NetworkSettings") || "{}");
    }else {
        localStorage.setItem("NetworkSettings", JSON.stringify(nodeDetails));
    }

    let cChain: EVMAPI = new Avalanche(nodeDetails.IP, nodeDetails.PORT, nodeDetails.PROTOCOL, nodeDetails.NETWORK_ID).CChain();

    let tx = {
                 /*name()*/
        "data": "0x06fdde03",
        "to": tokenAddress,
    }
    return cChain.callMethod("eth_call", [tx, "latest"], "ext/bc/C/rpc");
}
/**Gets the token symbol
 */
export async function getTokenSymbol(tokenAddress: string): Promise<RequestResponseData> {
    let nodeDetails= {
        IP: 'api.avax-test.network',
        PORT: 443,
        NETWORK_ID: 1,
        CHAIN_ID: 43113,
        PROTOCOL: 'https'
    };
    if(localStorage.getItem("NetworkSettings")) {
        nodeDetails = JSON.parse(localStorage.getItem("NetworkSettings") || "{}");
    }else {
        localStorage.setItem("NetworkSettings", JSON.stringify(nodeDetails));
    }

    let cChain: EVMAPI = new Avalanche(nodeDetails.IP, nodeDetails.PORT, nodeDetails.PROTOCOL, nodeDetails.NETWORK_ID).CChain();

    let tx = {
                 /*name()*/
        "data": "0x95d89b41",
        "to": tokenAddress,
    }
    return cChain.callMethod("eth_call", [tx, "latest"], "ext/bc/C/rpc");
}
/**
 * Gets the smallest denomination of the token, i.e the smallest "piece" it can be divided into.
 */
export async function getTokenDecimals(tokenAddress: string): Promise<RequestResponseData> {


    let nodeDetails= {
        IP: 'api.avax-test.network',
        PORT: 443,
        NETWORK_ID: 1,
        CHAIN_ID: 43113,
        PROTOCOL: 'https'
    };
    if(localStorage.getItem("NetworkSettings")) {
        nodeDetails = JSON.parse(localStorage.getItem("NetworkSettings") || "{}");
    }else {
        localStorage.setItem("NetworkSettings", JSON.stringify(nodeDetails));
    }

    let cChain: EVMAPI = new Avalanche(nodeDetails.IP, nodeDetails.PORT, nodeDetails.PROTOCOL, nodeDetails.NETWORK_ID).CChain();


    let tx = {
                 /*name()*/
        "data": "0x313ce567",
        "to": tokenAddress,
    }
    return cChain.callMethod("eth_call", [tx, "latest"], "ext/bc/C/rpc");
}

/**
 * Gets the transaction receipt
 */
 export async function getTransactionReceipt(txHash: string): Promise<RequestResponseData> {
    let nodeDetails= {
        IP: 'api.avax-test.network',
        PORT: 443,
        NETWORK_ID: 1,
        CHAIN_ID: 43113,
        PROTOCOL: 'https'
    };
    if(localStorage.getItem("NetworkSettings")) {
        nodeDetails = JSON.parse(localStorage.getItem("NetworkSettings") || "{}");
    }else {
        localStorage.setItem("NetworkSettings", JSON.stringify(nodeDetails));
    }

    let cChain: EVMAPI = new Avalanche(nodeDetails.IP, nodeDetails.PORT, nodeDetails.PROTOCOL, nodeDetails.NETWORK_ID).CChain();
    return cChain.callMethod("eth_getTransactionReceipt", [txHash], "ext/bc/C/rpc");
}

/**
 * Adds a new token to the list, I will change the entire behaviour of the token list eventually so this is temporary.
 */
export function addTokenToList(token: IToken) {

    let nodeDetails= {
        IP: 'api.avax-test.network',
        PORT: 443,
        NETWORK_ID: 1,
        CHAIN_ID: 43113,
        PROTOCOL: 'https'
    };
    if(localStorage.getItem("NetworkSettings")) {
        nodeDetails = JSON.parse(localStorage.getItem("NetworkSettings") || "{}");
    }else {
        localStorage.setItem("NetworkSettings", JSON.stringify(nodeDetails));
    }

    let currentTokensList: ITokenCache = JSON.parse(localStorage.getItem("TokenCache" + nodeDetails.CHAIN_ID) || "{}");

    currentTokensList.tokenVault[0].tokens.push({
        tokenName: token.name,
        tokenSymbol: token.symbol,
        tokenAddress: token.address,
        tokenDecimals: token.decimals,
        tokenBalance: 0,
        tokenLogoURI: token.logoURI != "" ? token.logoURI : "https://snowtrace.io/images/main/empty-token.png",
    });

    localStorage.setItem("TokenCache" + nodeDetails.CHAIN_ID, JSON.stringify(currentTokensList));
}


//variable vault represents the storage information about the wallet, which is:
//Encrypted seed phrase
//Some wallet personalization settings
export interface IVault{
    seedPhrase: string;
}