import { Avalanche, Buffer, } from "avalanche"
import { EVMAPI } from "avalanche/dist/apis/evm";
import { RequestResponseData } from "avalanche/dist/common";
import BigNumber from "bignumber.js";
import { hdkey } from "ethereumjs-wallet";
import { keccak256 } from "@ethersproject/keccak256";
import { MetroRPC } from "metro_scripts/src/api/metroRPC";
import { Account, IUnsignedEVMTransaction, IWalletMethods, IWalletSettings, IWalletState, WalletTypes } from "./IWalletInterfaces";
import { ITokenCache, IMetroToken } from "./tokens";
import { IMetroTransaction, ITransactionHistory } from "./txHistory";


//@ts-ignore
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
//@ts-ignore

//@ts-ignore
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
//@ts-ignore

//@ts-ignore
import AppAvax from '@obsidiansystems/hw-app-avalanche';
//@ts-ignore

//@ts-ignore
import Eth from '@ledgerhq/hw-app-eth'
//@ts-ignore

// ! LEDGER STILL WIP!


export class WalletStateLedger implements IWalletMethods {


    //Basic node details default to test network
    public nodeDetails = {
        IP: 'api.avax.network',
        PORT: 443,
        NETWORK_ID: 1,
        CHAIN_ID: 43114,
        PROTOCOL: 'https'
    }

    public app: AppAvax;
    public eth?: Eth;

    
    public avaxAmountAtto: BigNumber = new BigNumber("0");
    public avaxAmountWhole: string = "Loading...";
    public avaxAmountWholePrecise: string = '';

    public currentWallet: Account = new Account(Buffer.from("0x4127dfbd2b0f3504739da4332db29d635873e5f5d8757a0b28a87fd88d7ab0e1"), 1);
    public cChain: EVMAPI;

    avalanche = new Avalanche(this.nodeDetails.IP, this.nodeDetails.PORT, this.nodeDetails.PROTOCOL, this.nodeDetails.NETWORK_ID);

        
    walletData: IWalletState = {
        networkID: 1,
        accounts: [],
    };

    public isSearchingTokens: boolean = false; //Are we currently searching if the address has tokens in the token list?

    public tokensCache: ITokenCache = {
        hasSearchedAllTokens: false,
        tokenVault: {
            address: "",
            tokens: []
        }
    };

    public walletSettings: IWalletSettings = {
        currentAccountIndex: 0,
        highestAccountIndex: 0,
        walletType: WalletTypes.Ledger,
    }

    public txHistory: ITransactionHistory;

    toHexString(byteArray: any) {
        return Array.prototype.map.call(byteArray, function(byte) {
          return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
      }

    constructor() {
        console.log("Trying...");
        
        TransportWebHID.create().then((transport) => {
            console.log(transport);

            this.app = new AppAvax(transport, 'w0w');
            this.eth = new Eth(transport, 'w0w');

            let config = this.app.getAppConfiguration().then((v: any) => {
                console.log(v);
                this.eth?.getAddress("m/44'/60'/0'/0/0", true, true).then((v: any) => {
                    console.log(v.address);
                });
                //this.app.getWalletExtendedPublicKey("m/44'/60'/0'/0/0").then((v: any) => {
                //    let s = keccak256(v.public_key);
                //    console.log(s);
                //});
            });
            //this.eth.eth2GetPublicKey("44'/60'/0'/0/0").then((v: any) => {
            //    console.log(this.toHexString(v.public_key));
            //});
            
        }).catch((e) => {
            console.log("HID ERROR: ", e);

        });

        //const foundDevice = navigator.usb.getDevices().then((devices) => {
        //    return devices.find((device) => {
        //        device.manufacturerName == 'Ledger'
        //    });
        //});
//
        //foundDevice.then((dev) => {
        //    console.log(dev);
        //})
        //getAddress();


        if(localStorage.getItem("NetworkSettings")) {
            this.nodeDetails = JSON.parse(localStorage.getItem("NetworkSettings") || "{}");
        }else {
            localStorage.setItem("NetworkSettings", JSON.stringify(this.nodeDetails));
        }
        if(localStorage.getItem("WalletSettings") != null) {
            this.walletSettings = JSON.parse(localStorage.getItem("WalletSettings") || "{}");
        }else {
            this.walletSettings = {
                currentAccountIndex: 0,
                highestAccountIndex: 0,
                walletType: WalletTypes.Ledger
            }
        }
        //this.walletData.avalanche = new Avalanche(this.nodeDetails.IP, this.nodeDetails.PORT, this.nodeDetails.PROTOCOL, this.nodeDetails.NETWORK_ID);

        localStorage.setItem("NetworkSettings", JSON.stringify(this.nodeDetails));

        this.cChain = this.avalanche.CChain();


        //localStorage.removeItem("TokenCache");  //debug purposes...
        if(localStorage.getItem("TokenCache" + this.nodeDetails.CHAIN_ID + "_" + this.currentWallet.index) != null) {
            this.tokensCache = JSON.parse(localStorage.getItem("TokenCache" + this.nodeDetails.CHAIN_ID + "_" + this.currentWallet.index) || "{}");
            if(this.tokensCache.hasSearchedAllTokens == true && this.tokensCache.tokenVault.tokens.length > 0) {
                this.updateCurrentTokens();
            }else if (this.tokensCache.hasSearchedAllTokens == false){
                this.isSearchingTokens = true;
                this.updateAllTokens();
            }
        }else {
            this.isSearchingTokens = true;
            this.updateAllTokens();
        }
        if(localStorage.getItem("TransactionHistory" + this.nodeDetails.CHAIN_ID + "_" + this.currentWallet.index)) {
            this.txHistory = JSON.parse(localStorage.getItem("TransactionHistory" + this.nodeDetails.CHAIN_ID + "_" + this.currentWallet.index) || '{}');
        }else {
            this.txHistory = {
                history: {
                    accountIndex: this.currentWallet.index,
                    transactions: []
                }
            }
            localStorage.setItem("TransactionHistory" + this.nodeDetails.CHAIN_ID + "_" + this.currentWallet.index, JSON.stringify(this.txHistory));
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
                    localStorage.setItem("TransactionHistory" + this.nodeDetails.CHAIN_ID + "_" + this.currentWallet.index, JSON.stringify(newHistory));

                    navigator.serviceWorker.controller?.postMessage({
                        method: MetroRPC.CLEAR_PENDING_TRANSACTIONS
                    });
                }
            }
        }
        navigator.serviceWorker.controller?.postMessage({
            method: MetroRPC.GET_SUCCESFUL_TRANSACTIONS
        });
        navigator.serviceWorker.controller?.postMessage({
            method: MetroRPC.SET_NODE_URI,
            uri: this.nodeDetails.PROTOCOL + "://" + this.nodeDetails.IP + ":" + this.nodeDetails.PORT + "/ext/bc/C/rpc",
        });

    }

    async updateAllTokensRec(): Promise<void> {
    }
    async updateCurrentTokens(): Promise<void> {
    }
    async updateAllTokens(): Promise<void> {
    }
    getCurrentAddress(): string {
        throw new Error("Method not implemented.");
    }
    async updateAvaxBalance(): Promise<void> {
    }
    updateChainID(chainID: number): void {
    }
    changeAccount(accountIndex: number): void {
    }
    resetTxHistory(): void {
    }
    getNonce(): Promise<RequestResponseData> {
        throw new Error("Method not implemented.");
    }
    estimateGasLimit(txObject: IUnsignedEVMTransaction): Promise<RequestResponseData> {
        throw new Error("Method not implemented.");
    }
    getPriorityGasPrice(): Promise<RequestResponseData> {
        throw new Error("Method not implemented.");
    }
    getBaseFeePrice(): Promise<RequestResponseData> {
        throw new Error("Method not implemented.");
    }
    signTransaction(unsignedTx: IUnsignedEVMTransaction): Promise<string> {
        throw new Error("Method not implemented.");
    }
    issueRawTransaction(signedTxPayload: string): Promise<RequestResponseData> {
        throw new Error("Method not implemented.");
    }
    sendTx(recipentAddress: string, amount: string, maxFee: string, priorityGasFee: string, gasLimit: string, token: IMetroToken | null): Promise<RequestResponseData> {
        throw new Error("Method not implemented.");
    }
    getGasEstimates(recipentAddress: string, amount: string, token: IMetroToken | null): Promise<any> {
        throw new Error("Method not implemented.");
    }
    async getGasEstimateRaw(rawTxData: IUnsignedEVMTransaction) {
        throw new Error("Method not implemented.");
    }
    async openTxInExplorer(txHash: string) {
    }
    deleteWallet(): void {
    }
}