import { Component, OnInit } from '@angular/core';



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
    window.open('metroWeb/index.html', '_blank')?.focus();
  }

  generateNewWallet() {
    localStorage.setItem("GenerateNewWallet", '{}');
    window.open('metroWeb/index.html', '_blank')?.focus();
  }

}
