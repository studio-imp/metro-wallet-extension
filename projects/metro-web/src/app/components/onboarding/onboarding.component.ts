import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { mnemonicToSeedSync, validateMnemonic } from "bip39";
import { IVault } from 'src/metro_backend/walletState';
import { encrypt, decrypt } from '@metamask/browser-passworder';



export enum OnboardingPhase {
  INTRODUCTION,
  SEED_PHRASE,
  PASSWORD,
  PIN_CODE,
  FINISHED,
}

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit {

  seedPhrase: string = "";

  tabs = OnboardingPhase;
  currentTab: OnboardingPhase = OnboardingPhase.INTRODUCTION;

  @Output() generateWalletEvent = new EventEmitter();
  constructor() {

  }
  pinCode: string = "";
  password: string = "";

  verificationStep: string = '';
  isVerifyingPin: boolean = false;

  ngOnInit(): void {
  }
  updateSeed(event: string) {
    this.seedPhrase = event;
  }
  updatePassword(event: string, isVerification: boolean) {
    if(isVerification) {
      this.verificationStep = event;
    } else {
      this.password = event;
    }
  }
  updatePincode(event: string[], isVerification: boolean) {
    if(isVerification) {
      this.verificationStep = event.join('');
    } else {
      this.pinCode = event.join('');
    }
  }

  next() {

    if(this.currentTab == this.tabs.INTRODUCTION) {
      this.currentTab = this.tabs.SEED_PHRASE;
      return;
    }

    if(this.currentTab == this.tabs.SEED_PHRASE) {
      if (validateMnemonic(this.seedPhrase) == false) {
        alert("Invalid Seed Phrase!");
      } else {
        this.currentTab = this.tabs.PASSWORD;
        return;
      }
      return;
    }
    if(this.currentTab == this.tabs.PASSWORD) {
      if(this.password.length < 10) {
        alert("Password needs to be at least 10 characters long");
      } else if (this.password == this.verificationStep) {
        this.verificationStep = '';
        this.currentTab = this.tabs.PIN_CODE;
        return;
      }else {
        alert("Passwords entered do not match!");
      }
      return;
    }
    if(this.currentTab == this.tabs.PIN_CODE) {
      if(this.pinCode.length == 6) {
        if(this.isVerifyingPin == false) {
          this.isVerifyingPin = true;
          return;
        }else {
          if(this.verificationStep == this.pinCode) {
            //Might do something here later...
          } else {
            alert("Pincode does not match! Please re-enter");
            this.isVerifyingPin = false;
            return;
          }
        }
      }else {
        alert("Pin code needs to be 6 digits!");
        return;
      }
    }

    if (validateMnemonic(this.seedPhrase) == false) {
      alert("Invalid Seed Phrase!");
    } else {
      encrypt(this.pinCode, this.seedPhrase).then((pinEncryptedSeed) => {
        encrypt(this.password, pinEncryptedSeed).then((passwordEncryptedSeed) => {

          localStorage.setItem("Vault", passwordEncryptedSeed);
          console.log("Succesfully Initialized Wallet!");
          this.seedPhrase = "";
          this.generateWalletEvent.emit();
          this.currentTab = this.tabs.FINISHED;
        });
      });
    }
  }
}
