import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CurrentPopups } from 'src/app/app.component';

@Component({
  selector: 'app-connect-popup',
  templateUrl: './connect-popup.component.html',
  styleUrls: ['./connect-popup.component.scss']
})
export class ConnectPopupComponent implements OnInit {

  currentPopup = CurrentPopups;
  @Input() popupState: CurrentPopups;
  @Input() showPopup: boolean;

  @Input() connectedPorts: any;

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
