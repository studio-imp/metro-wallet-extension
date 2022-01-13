import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { CurrentPopups } from 'src/app/app.component';
import { IWalletMethods } from 'src/metro_backend/IWalletInterfaces';
import { IMetroToken } from 'src/metro_backend/tokens';
import { WalletState } from 'src/metro_backend/walletState';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {

  currentPopup = CurrentPopups;
  @Input() popupState: CurrentPopups;
  @Input() showPopup: boolean;

  @Input() tokenArray: IMetroToken[] | null = null;
  @Input() currentAvaxAmount: string = '';
  
  @Input() connectedPorts: any;

  @Input() walletState: IWalletMethods | null = null;

  @Output() closePopup = new EventEmitter();
  @Output() openConnectionModalEvent = new EventEmitter<number>();
  
  constructor() {
    this.popupState = this.currentPopup.SEND_POPUP;
    this.showPopup = false;
  }
  ngOnInit(): void {
  }
  closePopupButton(){
    this.closePopup.emit();
  }
  openConnectionModal(tabId: any) {
    this.openConnectionModalEvent.emit(tabId);
  }
}
