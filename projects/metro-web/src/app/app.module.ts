import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { InputFancyComponent } from './components/input-fancy/input-fancy.component';
import { DefaultButtonComponent } from './components/default-button/default-button.component';
import { PincodeInputComponent } from './components/pincode-input/pincode-input.component';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    OnboardingComponent,
    InputFancyComponent,
    DefaultButtonComponent,
    PincodeInputComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
