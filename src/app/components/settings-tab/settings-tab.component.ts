import { Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import { WalletState } from 'src/metro_backend/walletState';

@Component({
  selector: 'app-settings-tab',
  templateUrl: './settings-tab.component.html',
  styleUrls: ['./settings-tab.component.scss']
})
export class SettingsTabComponent implements OnInit {


  @Input() walletState: WalletState | null = null;

  @Output() setChainID: EventEmitter<number> = new EventEmitter<number>();
  @Output() clearTransactionHistory = new EventEmitter();



  constructor() { }

  ngOnInit(): void {
  }

  updateChainID(chainID: any) {
    this.setChainID.emit(chainID);
  }

  clearTxHistory() {
    this.clearTransactionHistory.emit();
  }

  resetWallet() {
    
  }
}
