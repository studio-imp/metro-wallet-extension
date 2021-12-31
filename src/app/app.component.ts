import { Component, NgZone } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  query,
  animateChild,
  sequence,
  // ...
} from '@angular/animations';
import { IVault, WalletState } from 'src/metro_backend/walletState';
import { MetroRPC } from 'metro_scripts/src/api/metroRPC';


/* --- Note # xavax # we are one @
    This wallet is fairly straight-forward, a dev should be able to verify all the code in one(or at least less than 10 :p)
    sitting, this is an important part for the Metro web wallet.
*/

/*#------------------------------------------------------------------------------------------------------#*/


export enum WalletUnlockStages {
  PASSWORD_AND_PINCODE,
  ONBOARDING,
  UNLOCKED,
  PINCODE,
  NONE,
}

export enum CurrentTabs {
  SETTINGS_TAB,
  ASSETS_TAB,
  SEND_TAB,
}
class Tabs {
  constructor(public tab: CurrentTabs) {}
}

export enum Modals {
  VIEW_TRANSACTION_INFO,
  VIEW_CONNECTION_INFO,
  VIEW_TOKEN_INFO,
  ADD_TOKEN,
  NONE,
}
class CurrentModal {
  constructor(public modal: Modals) {}
}

export enum CurrentPopups {
  CONNECT_POPUP,
  SEND_POPUP,
}
class Popups {
  constructor(public popup: CurrentPopups) {}
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('fadeOut', [
      state('void', style({
        opacity: 0,
      })),
      
      transition('* <=> void', sequence([
        animate('125ms')
      ])),
    ]),
  ]
})
export class AppComponent {
  title: string = 'Metro Wallet';

  //A tab is the current page of the wallet that is displayed, i.e send tab, assets tab, settings tab, etc.
  currentTab = CurrentTabs;
  public tabs: Tabs;

  isModalEnabled: boolean = false;
  modals = Modals;
  public currentModal = new CurrentModal(Modals.NONE);

  //A Popup is a window that is hidden, but can be "popped-up" from the bottom of the wallet, the popup is used
  //to increase the amount of functionality in a smaller wallet-view, and also provide a convenient way to show
  //arbitrary data.
  currentPopup = CurrentPopups;
  public popups: Popups;
  public showPopup: boolean;

  currentConnections: any = null;
  arrayOfConnections: any = null;
  selectedPort: any = null;

  //public isWalletInitialized: boolean | null = null; //if we have initialized the wallet with a seed/priv-key/ledger.
  walletStages = WalletUnlockStages;
  currentWalletStage: WalletUnlockStages = this.walletStages.NONE;
  encryptedSeedData: string = '';

  //public wallet: WalletState = new WalletState("between trash soccer inflict quit gorilla oblige ordinary ski duty member result train connect surface behind state regular nominee school rice core drink craft");
  public wallet: WalletState | null = null;

  public currentWalletAddress: string = "";
  
  ngOnInit() {

    // 1 - Try to get seed from worker
    // 2 - If worker isn't initialized with a seed, we try get seed from local storage, then we init worker with encrypted seed.
    // 3 - does local-storage not have the double encrypted seed? Then we need to create/import a new wallet. 

    //Seed is two-layer encrypted with: Pin and Password.

    navigator.serviceWorker.controller?.postMessage({
      method: MetroRPC.REQUEST_SEED
    });
    navigator.serviceWorker.controller?.postMessage({
      method: MetroRPC.GET_CURRENT_CONNECTIONS
    });
    navigator.serviceWorker.onmessage = (event) => {
      if(event.data) {
        this.ngZone.run(()=> {
          if(event.data.method == MetroRPC.GET_CURRENT_CONNECTIONS) {
            this.currentConnections = JSON.parse(event.data.data.ports);
            this.arrayOfConnections = Object.values(this.currentConnections);
          }
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
  constructor(private ngZone: NgZone) {

    this.tabs = new Tabs(CurrentTabs.SEND_TAB);
    this.popups = new Popups(CurrentPopups.SEND_POPUP);
    this.showPopup = false;

    //Subscribe to events.
  }

  initWallet(seedPhrase: string) {
    this.wallet = new WalletState(seedPhrase);
                        
    //Set the initial current address.
    this.currentWalletAddress = this.wallet.getCurrentAddress();
    this.updateAvaxAmount();

    this.encryptedSeedData = '';
    this.currentWalletStage = this.walletStages.UNLOCKED;
  }
  
  openMetroWeb() {
    window.open('metroWeb/index.html', '_blank')?.focus();
  }
  openTxInExplorer(txHash: any) {
    if(this.wallet != null) {
      this.wallet.openTxInExplorer(txHash);
    }
  }
  public deleteWallet() {
    localStorage.removeItem("Vault");
    navigator.serviceWorker.controller?.postMessage({
      method: MetroRPC.DELETE_VAULT
    });
  }
  updateChainID(chainID: number) {
    if(this.wallet != null) {
      this.wallet.updateChainID(chainID);
    }
  }
  clearTxHistory() {
    if(this.wallet != null) {
      this.wallet.resetTxHistory();
    }
  }

  openConnectionModal(tabId: any) {
    if(tabId in this.currentConnections) {
      this.selectedPort = this.currentConnections[tabId];
    }
    this.currentModal.modal = this.modals.VIEW_CONNECTION_INFO;
    this.isModalEnabled = true;
  }
  deleteConnection(tabId: any) {
    if(tabId in this.currentConnections) {
      this.selectedPort = null;
      navigator.serviceWorker.controller?.postMessage({
        method: MetroRPC.DELETE_PORT,
        tabId: tabId,
      });
      delete this.currentConnections[tabId];
      this.arrayOfConnections = Object.values(this.currentConnections);
    }
    this.isModalEnabled = false;
    this.currentModal.modal = this.modals.NONE;
  }

  //Sets the current tab.
  setTab(tab: CurrentTabs) {
    this.tabs.tab = tab;
  }
  //Toggles the current popup, to disable/hide the popup simply set it to 'CurrentPopups.NONE', or
  //call togglePopup with the popup that is already enabled.
  setPopup(popup: CurrentPopups) {
      this.popups.popup = popup;
  }
  async updateAvaxAmount() {
    await this.wallet?.updateAvaxBalance();
  }
  togglePopup() {
    this.showPopup = !this.showPopup;
  }
  closePopup() {
    this.showPopup = false;
  }


  addNewToken() {
    this.currentModal.modal = this.modals.ADD_TOKEN;
    this.isModalEnabled = true;
  }
  closeModal() {
    this.isModalEnabled = false;
    this.currentModal.modal = this.modals.NONE;
  }

}
