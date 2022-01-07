import { Component, Input, NgZone } from '@angular/core';
import BigNumber from 'bignumber.js';
import { MetroRPC } from 'metro_scripts/src/api/metroRPC';
import { IUnsignedEVMTransaction, WalletState } from 'src/metro_backend/walletState';
import { TransactionTypes } from 'src/metro_backend/decodeEVMTx';
import { IFunctionData } from 'src/metro_backend/decodeEVMTx';
import { decodeTransactionData } from 'src/metro_backend/decodeEVMTx';




export enum WalletUnlockStages {
  PASSWORD_AND_PINCODE,
  ONBOARDING,
  UNLOCKED,
  PINCODE,
  NONE,
}

export enum Notifications {
  APPROVE_CONNECTION,
  APPROVE_CONTRACT_CALL,
  ISSUE_TRANSACTION,
  SIGN_MESSAGE,
  TRANSACTION_ISSUED,
  NONE,
}
export class CurrentNotification {
  constructor(public notification: Notifications) {}
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Metro Notification';


  //We need an instance of the current wallet in order to accept/refuse txs and connections.
  public wallet: WalletState | null = null;

  currentWalletAddress: string = "";

  notificationSource: string = "Unknown";
  notificationTitle: string = "Unknown";
  notificationText: string = "";

  infoBoxText: string = "";

  txHash: string = "";

  notification = Notifications;
  public currentNotification: CurrentNotification = new CurrentNotification(Notifications.NONE);

  currentTx: any = null;
  currentNotifPort: any = null; 
  txNotificationData: any = null;

  walletStages = WalletUnlockStages;
  currentWalletStage: WalletUnlockStages = this.walletStages.NONE;
  encryptedSeedData: string = '';

  ngOnInit() {

  }
  constructor(private ngZone: NgZone) {
    // 1 - Try to get seed from worker
    // 2 - If worker isn't initialized with a seed, we try get seed from local storage, then we init worker with encrypted seed.
    // 3 - does local-storage not have the double encrypted seed? Then we need to create/import a new wallet. 

    //Seed is two-layer encrypted with: Pin and Password.

    navigator.serviceWorker.controller?.postMessage({
      method: MetroRPC.REQUEST_SEED
    });
    navigator.serviceWorker.onmessage = (event) => {
      if(event.data) {
        this.ngZone.run(()=> {
          if(event.data.method == MetroRPC.REQUEST_SEED) {
                if(event.data.data.status == "HAS_SEED") {

                  this.currentWalletStage = this.walletStages.PINCODE;
                  this.encryptedSeedData = event.data.data.pinEncryptedSeed;

                }else if(event.data.data.status == "NO_SEED"){
                  if(localStorage.getItem("Vault") != null) {
                    //Get the vault where the encrypted seed is stored.

                    let v = localStorage.getItem("Vault") || '{}';
                    this.currentWalletStage = this.walletStages.PASSWORD_AND_PINCODE;
                    this.encryptedSeedData = v;
              
                  } else {
                    this.currentWalletStage = this.walletStages.ONBOARDING;
                    return;
                  }
                }
            }
        });
      }
    }
  }

  initWallet(seedPhrase: string) {
    this.wallet = new WalletState(seedPhrase);
                        
    //Set the initial current address.
    this.currentWalletAddress = this.wallet.getCurrentAddress();

    this.encryptedSeedData = '';
    this.currentWalletStage = this.walletStages.UNLOCKED;

    //Request notifications from the worker
    navigator.serviceWorker.controller?.postMessage({
      method: 'getNotificationRequests'
    });
  
    //Check for different notification events
    navigator.serviceWorker.onmessage = (event) => {
      if(event.data) {
        this.ngZone.run(()=> {
          if(event.data.method === 'requestAccess') {
            this.notificationSource = event.data.data.params.from;
            this.notificationTitle = "Approve Connection";
            this.currentNotification.notification = this.notification.APPROVE_CONNECTION;
            this.notificationText = "Approve dApp Connection";
            this.currentNotifPort = JSON.parse(event.data.data.port);
            this.infoBoxText = "Approving will allow " + event.data.data.from + " access to view your accounts as well as request transactions which you can " +
                                "either accept or decline. \n \n Do not approve connection to web-pages that you do not trust, and always double-check transactions.";

          }

          if(event.data.method === 'eth_sendTransaction') {
            this.notificationSource = event.data.data.from;
            this.currentNotification.notification = this.notification.ISSUE_TRANSACTION;
            this.notificationTitle = "Issue Transaction";
            this.notificationText = "Issue a transaction to the network";
            
            this.currentTx = event.data.data.data;
            
            //event.data.data.data[0], I know, stfu...
            decodeTransactionData(event.data.data.data[0]).then((data) => {
              if(data != undefined) {
                BigNumber.set({DECIMAL_PLACES: 6});
                switch(data.functionName) {
                  case 'swapExactAVAXForTokens' : {
                    this.txNotificationData = {
                      txType: TransactionTypes.SWAP_EXACT_AVAX_FOR_TOKENS,
                      avaxAmountToSend: new BigNumber(data?.functionParameterData[0]).div('1000000000000000000').toString(),
                      tokenAmountToGet: new BigNumber('0x' + data?.functionParameterData[1]).div('1000000000000000000').toString(),
                    }
                    break;
                  }
                  case 'swapExactTokensForAVAX' : {
                    this.txNotificationData = {
                      txType: TransactionTypes.SWAP_EXACT_TOKENS_FOR_AVAX,
                      tokenAmountToSend: new BigNumber('0x' + data?.functionParameterData[0]).div('1000000000000000000').toString(),
                      avaxAmountToGet: new BigNumber('0x' + data?.functionParameterData[1]).div('1000000000000000000').toString(),
                    }
                    break;  
                  }
                  default: {
                    this.txNotificationData = null;
                    break;
                  }
                }
              }
            });

            this.infoBoxText = "Approving will issue a transactions with the details above to the network. Beware of all malicious actors! Custody of your own assets requires great responsibility."
          }
        });
      }
    } 
  }

  /*--- Send/Reject transaction methods ---*/
  issueTransaction() {
    console.log("SEND TRANSACTION!");
  }
  rejectTransaction() {
    console.log("REJECT TRANSACTION!");
    navigator.serviceWorker.controller?.postMessage({
      method: "closePopup",
    });
  }
  /*--- Approve/Reject transaction methods ---*/

  /* --- requestAccess methods ---*/
  async approve(data: any | null) {
    if(this.currentNotification.notification == this.notification.APPROVE_CONNECTION) {
      navigator.serviceWorker.controller?.postMessage({
        method: 'approveAccess',
        accounts: [this.currentWalletAddress],
        chainId:  '0x' + this.wallet?.nodeDetails.CHAIN_ID.toString(16), //"0xA869", //0xA869 0xA86A,
        nodeIp: this.wallet?.nodeDetails.IP,
        port: this.currentNotifPort
      });

      navigator.serviceWorker.controller?.postMessage({
        method: "closePopup",
      });

    } 
    if(this.currentNotification.notification == this.notification.ISSUE_TRANSACTION && data != null) {
      this.notificationTitle = "Transaction Sent";

      if(this.wallet != null) {
        
        let signedTx = await this.wallet.signTransaction(data);
        let txHash = await this.wallet.issueRawTransaction(signedTx);
        this.txHash = txHash.data.result;
        navigator.serviceWorker.controller?.postMessage({
          method: "eth_sendTransaction",
          response: txHash.data
        });

      } else {
        console.error("WALLET IS NULL!");

      }
    }
  }
  async reject() {

    if(this.currentNotification.notification == this.notification.APPROVE_CONNECTION) {
      navigator.serviceWorker.controller?.postMessage({
        method: 'rejectAccess',
      });
      navigator.serviceWorker.controller?.postMessage({
        method: "closePopup",
      });
    }
    if(this.currentNotification.notification == this.notification.ISSUE_TRANSACTION) {

      navigator.serviceWorker.controller?.postMessage({
        method: "eth_sendTransaction",
        response: "REJECT"
      });

      navigator.serviceWorker.controller?.postMessage({
        method: "closePopup",
      });
    }
  }
  async closePopup() {
    navigator.serviceWorker.controller?.postMessage({
      method: "closePopup",
    });
  }
  /* --- requestAccess methods ---*/
  
}
