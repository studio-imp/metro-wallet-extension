import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { IMetroToken } from 'src/metro_backend/tokens';
import { IMetroTransaction } from 'src/metro_backend/txHistory';


@Component({
  selector: 'app-assets-tab',
  templateUrl: './assets-tab.component.html',
  styleUrls: ['./assets-tab.component.scss']
})
export class AssetsTabComponent implements OnInit {

  @Input() isEnabled: boolean = false;
  
  isHistoryTabEnabled: boolean;
  
  @Input() avaxAmount: string = "0.00";
  @Input() tokenArray: IMetroToken[] | null = null;

  @Input() txHistory: IMetroTransaction[] | null = null;

  
  @Output() addTokenButtonClick = new EventEmitter();
  @Output() openTxHash = new EventEmitter<string>();


  constructor() {
    this.isHistoryTabEnabled = false;
  }
  ngOnInit(): void {
  }


  addNewToken() {
    this.addTokenButtonClick.emit();
  }
  openTxInExplorer(txHash: any) {
    this.openTxHash.emit(txHash);
  }
  openDashboard() {
    window.open('metroWeb/index.html', '_blank')?.focus();
  }
}
