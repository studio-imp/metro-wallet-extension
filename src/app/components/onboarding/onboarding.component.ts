import { Component, OnInit } from '@angular/core';
import { IWalletMethods } from 'src/metro_backend/IWalletInterfaces';
import { WalletStateLedger } from 'src/metro_backend/walletStateLedger';



export enum OnboardingTabs {
  MAIN_MENU,
  HARDWARE_WALLET
}
@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit {

  tabs = OnboardingTabs;
  currentTab: OnboardingTabs = OnboardingTabs.MAIN_MENU;

  constructor() { }

  ngOnInit(): void {
  }

  openXavaxWebsite(){
    window.open('https://xavax.io', '_blank')?.focus();
  }

  openMetroWeb() {
    localStorage.removeItem("GenerateNewWallet");
    window.open('metroWeb/index.html', '_blank')?.focus();
  }

  hardwareWallet() {
    //let w: IWalletMethods = new WalletStateLedger();
  }

  generateNewWallet() {
    localStorage.setItem("GenerateNewWallet", '{}');
    window.open('metroWeb/index.html', '_blank')?.focus();
  }

}
