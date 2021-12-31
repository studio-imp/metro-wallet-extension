import { Component } from '@angular/core';

export enum CurrentPages {
  WALLET,
  
  INITIALIZE_WALLET,
}
class Pages {
  constructor(public page: CurrentPages) {}
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Metro Wallet';


  currentPage = CurrentPages;
  public pages: Pages;

  //public isWalletInitialized: boolean = false; //if we have initialized the wallet with a seed/priv-key/ledger.

  constructor(){
    if(localStorage.getItem("Vault") != null) {
      this.pages = new Pages(CurrentPages.WALLET);
    } else {
      this.pages = new Pages(CurrentPages.INITIALIZE_WALLET);
      //this.pages = new Pages(CurrentPages.WALLET); // debug reasons
    }
  }

  updateWalletStatus() {
    if(localStorage.getItem("Vault") != null) {

    }
  }
}
