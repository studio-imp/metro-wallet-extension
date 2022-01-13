import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { Buffer } from 'buffer';
import { utils } from 'ethers';
import { getTokenName, getTokenDecimals, getTokenSymbol, addTokenToList } from 'src/metro_backend/utils';


export enum TokenSearchStates {
  NO_ADDRESS,     // The user hasn't put in an address.
  FAULTY_ADDRESS, // The address is an incorrect hex address.
  SEARCHING,      // Wallet is searching for a token.
  TOKEN_FOUND,    // Wallet has found a token, you can now add it!
  NO_TOKEN_FOUND, // No token found :(
}
/*
class CurrentModal {
  constructor(public modal: Modals) {}
}
 */


@Component({
  selector: 'app-add-new-token',
  templateUrl: './add-new-token.component.html',
  styleUrls: ['./add-new-token.component.scss']
})
export class AddNewTokenComponent implements OnInit {

  @Input() currentAddressIndex: number = 0;

  searchStates = TokenSearchStates; // Need to have a reference to the enum so we can use.
  currentSearchState: TokenSearchStates = TokenSearchStates.NO_ADDRESS;

  currentAddress: string = "";
  validTokenAddress: string = "";
  
  @Output() closeModalButton = new EventEmitter();

  tokenName: string = "";
  tokenSymbol: string = "";
  tokenDecimals: number = 0;

  constructor() { }


  ngOnInit(): void {
  }

  closeModal() {
    this.closeModalButton.emit();
  }


  //Handle the token search behavior based on the current user input of the token address.
  
  async tokenAddressInput(event: string) {
    //No need to do all the shit below if the token address is empty...
    if(event == "") {
      this.currentAddress = event;
      this.currentSearchState = this.searchStates.NO_ADDRESS;
      return;
    }
    //Only update our shit if we actually need to, this method gets called on ALL inputs.
    if(event != this.currentAddress) {
      this.currentAddress = event;
      /* -- Some simple address-checking logic to make sure the address is valid, updates UI  -- */
      this.currentSearchState = utils.isAddress(this.currentAddress) ? this.searchStates.SEARCHING : this.searchStates.FAULTY_ADDRESS;

      if(this.currentSearchState == this.searchStates.SEARCHING) {

        /* Using ERC20 name() method to check if the token exists, this is temporary okay... */
        getTokenName(this.currentAddress).then(async (response)=>{
          if(response.data.result == "0x") {
            this.currentSearchState = this.searchStates.NO_TOKEN_FOUND;
          }else {

            this.tokenSymbol = "Loading...";
            

            let decResponse = await getTokenDecimals(this.currentAddress);
            this.tokenDecimals = Number(decResponse.data.result);
  
            let symbolResponse = await getTokenSymbol(this.currentAddress);
            this.tokenSymbol = utils.toUtf8String(symbolResponse.data.result).replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '')

            this.currentSearchState = this.searchStates.TOKEN_FOUND;
            this.tokenName = utils.toUtf8String(response.data.result).replace(/[^A-Za-z 0-9 \.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, '')
          }
        }).catch((e)=> {
          console.warn(e);
          this.currentSearchState = this.searchStates.NO_TOKEN_FOUND;
        });
      }
    }
  }

  addToken() {
    if(this.currentSearchState == this.searchStates.TOKEN_FOUND) {
      addTokenToList({
        address: this.currentAddress,
        chainId: 43113,
        name: this.tokenName,
        symbol: this.tokenSymbol,
        decimals: this.tokenDecimals,
        logoURI: ""
      }, this.currentAddressIndex);
    }
    this.closeModal();
  }
}
