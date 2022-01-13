import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { DefaultButtonComponent } from './components/default-button/default-button.component';
import { SendTabComponent } from './components/send-tab/send-tab.component';
import { PopupComponent } from './components/popup/popup.component';
import { SendPopupComponent } from './components/popup/send-popup/send-popup.component';
import { InputFancyComponent } from './components/input-fancy/input-fancy.component';
import { ConnectPopupComponent } from './components/popup/connect-popup/connect-popup.component';
import { ToggleButtonComponent } from './components/toggle-button/toggle-button.component';
import { TxModuleComponent } from './components/tx-module/tx-module.component';
import { AssetsTabComponent } from './components/assets-tab/assets-tab.component';
import { ModalModuleComponent } from './components/modal-module/modal-module.component';
import { AddNewTokenComponent } from './components/modal-module/add-new-token/add-new-token.component';
import { SendTransactionComponent } from './components/modal-module/send-transaction/send-transaction.component';
import { SelectAssetComponent } from './components/modal-module/select-asset/select-asset.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { UnlockWalletPageComponent } from './components/unlock-wallet-page/unlock-wallet-page.component';
import { PincodeInputComponent } from './components/pincode-input/pincode-input.component';
import { FeeBoxComponent } from './components/fee-box/fee-box.component';
import { TxHistoryModuleComponent } from './tx-history-module/tx-history-module.component';
import { SettingsTabComponent } from './components/settings-tab/settings-tab.component';
import { ChainIDSelectionComponent } from './components/chain-id-selection/chain-id-selection.component';
import { DAppConnectionModuleComponent } from './components/d-app-connection-module/d-app-connection-module.component';
import { ViewConnectionInfoComponent } from './components/modal-module/view-connection-info/view-connection-info.component';
import { AccountSettingsModalComponent } from './components/modal-module/account-settings-modal/account-settings-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    DefaultButtonComponent,
    SendTabComponent,
    PopupComponent,
    SendPopupComponent,
    InputFancyComponent,
    ConnectPopupComponent,
    ToggleButtonComponent,
    TxModuleComponent,
    AssetsTabComponent,
    ModalModuleComponent,
    AddNewTokenComponent,
    SendTransactionComponent,
    SelectAssetComponent,
    OnboardingComponent,
    UnlockWalletPageComponent,
    PincodeInputComponent,
    FeeBoxComponent,
    TxHistoryModuleComponent,
    SettingsTabComponent,
    ChainIDSelectionComponent,
    DAppConnectionModuleComponent,
    ViewConnectionInfoComponent,
    AccountSettingsModalComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
