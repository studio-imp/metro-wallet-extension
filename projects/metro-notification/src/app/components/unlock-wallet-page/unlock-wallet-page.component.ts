import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import {encrypt, decrypt} from '@metamask/browser-passworder'
import { MetroRPC } from 'metro_scripts/src/api/metroRPC';
import { WalletUnlockStages } from '../../app.component';

@Component({
  selector: 'app-unlock-wallet-page',
  templateUrl: './unlock-wallet-page.component.html',
  styleUrls: ['./unlock-wallet-page.component.scss']
})
export class UnlockWalletPageComponent implements OnInit {


  seedStages = WalletUnlockStages;

  @Input() seedStage: WalletUnlockStages = WalletUnlockStages.PINCODE;
  @Input() encryptedSeed: string = '';

  @Output() onSeedDecrypt: EventEmitter<string> = new EventEmitter<string>();

  enteredPassword: string = '';
  enteredPincode: string = '';

  enteredWrongPin: boolean = false;
  enteredWrongPassword:  boolean = false;

  currentSeedData: string = '';

  hasEnteredPassword: boolean = false;

  constructor() {

  }

  ngOnInit(): void {
  }

  updatePassword(event: string) {
    this.enteredPassword = event;
  }
  updatePincode(event: string[]) {
    this.enteredPincode = event.join('');
    if(this.enteredPincode.length >= 6) {
      this.decryptSeed();
    }
  }


  //Decrypts the seed that should be at the last layer of encryption
  decryptSeed() {
    if(this.seedStage == WalletUnlockStages.PINCODE) {
      this.currentSeedData = this.encryptedSeed;
    }
    //This entire thing is a bit of a mess, might change it later to make it look nicer...
    decrypt(this.enteredPincode, this.currentSeedData).then((decipheredResult) => {
      this.enteredWrongPin = true;
      this.onSeedDecrypt.emit(decipheredResult as string);

      //cache the pin-encrypted seed so we can keep unlocking wallet with only the pin-code, as an extra security step.
      navigator.serviceWorker.controller?.postMessage({
        method: MetroRPC.INIT_WORKER_VAULT,
        pinEncryptedSeed: this.currentSeedData
      });

    }).catch((error) => {
      this.enteredWrongPin = true;
    });
  }

  submitPassword() {
    decrypt(this.enteredPassword, this.encryptedSeed).then((result) => {
      this.enteredWrongPassword = false;
      this.currentSeedData = result as string;
      this.hasEnteredPassword = true;
    }).catch((error) => {
      this.enteredWrongPassword = true;
      this.hasEnteredPassword = false;
    });
  }
}
