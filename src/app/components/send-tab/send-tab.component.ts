import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { IMetroToken, ITokenCache } from 'src/metro_backend/tokens';
import { IMetroTransaction } from 'src/metro_backend/txHistory';

@Component({
  selector: 'app-send-tab',
  templateUrl: './send-tab.component.html',
  styleUrls: ['./send-tab.component.scss'],
})
export class SendTabComponent implements OnInit {

  
  
  isHistoryTabEnabled: boolean;
  
  displayHoverText: boolean = false;
  
  @Input() avaxAmount: string = "0.00";
  @Input() currentAddress: string = "";
  @Input() tokenArray: IMetroToken[] | null = null;
  @Input() isSearchingTokens: boolean; //Are we currently searching for tokens? This is used for UI 

  @Input() txHistory: IMetroTransaction[] | null = null;
  
  @Output() sendButtonClick = new EventEmitter();
  @Output() connectButtonClick = new EventEmitter();
  @Output() addTokenButtonClick = new EventEmitter();

  @Output() openTxHash = new EventEmitter<string>();


  selectedAssetAmount: string = '';
  
  constructor() {
    this.isHistoryTabEnabled = false;
    this.isSearchingTokens = false;
  }
  ngOnInit(): void {

    
  }

  sendButton() {
    this.sendButtonClick.emit();
    navigator.serviceWorker.controller?.postMessage({
      type: 'bababooey',
    });
  }
  connectButton() {
    this.connectButtonClick.emit();
  }
  addNewToken() {
    this.addTokenButtonClick.emit();
  }
  copyAddressToClipboard() {
    navigator.clipboard.writeText(this.currentAddress);
  }
  openTxInExplorer(txHash: any) {
    this.openTxHash.emit(txHash);
  }
  toggleHover(toggleState: boolean) {
    this.displayHoverText = toggleState;
  }
}
