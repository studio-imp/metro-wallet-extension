import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NotificationModuleComponent } from './components/notification-module/notification-module.component';
import { DefaultButtonComponent } from './components/default-button/default-button.component';
import { InputFancyComponent } from './components/input-fancy/input-fancy.component';
import { PincodeInputComponent } from './components/pincode-input/pincode-input.component';
import { UnlockWalletPageComponent } from './components/unlock-wallet-page/unlock-wallet-page.component';
import { FeeBoxComponent } from './components/fee-box/fee-box.component';

@NgModule({
  declarations: [
    AppComponent,
    NotificationModuleComponent,
    UnlockWalletPageComponent,
    DefaultButtonComponent,
    PincodeInputComponent,
    InputFancyComponent,
    FeeBoxComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
