import { Component, Input, OnInit, Output, EventEmitter} from '@angular/core';
import { IWalletMethods } from 'src/metro_backend/IWalletInterfaces';
import { WalletState } from 'src/metro_backend/walletState';

@Component({
  selector: 'app-settings-tab',
  templateUrl: './settings-tab.component.html',
  styleUrls: ['./settings-tab.component.scss']
})
export class SettingsTabComponent implements OnInit {


  @Input() walletState: IWalletMethods | null = null;

  @Output() setChainID: EventEmitter<number> = new EventEmitter<number>();
  @Output() clearTransactionHistory = new EventEmitter();
  @Output() deleteWallet = new EventEmitter();



  constructor() { }

  ngOnInit(): void {
  }

  updateChainID(chainID: any) {
    this.setChainID.emit(chainID);
  }

  clearTxHistory() {
    this.clearTransactionHistory.emit();
  }

  deleteWalletButton() {
    this.deleteWallet.emit();
  }
}
