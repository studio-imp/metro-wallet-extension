import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { IMetroTransaction, TransactionStates } from 'src/metro_backend/txHistory';

@Component({
  selector: 'app-tx-history-module',
  templateUrl: './tx-history-module.component.html',
  styleUrls: ['./tx-history-module.component.scss']
})
export class TxHistoryModuleComponent implements OnInit {

  @Input() transaction: IMetroTransaction = {
    txType: 'owu',
    txHash: '',
    txAmount: '',
    assetName: 'Bug',
    assetSymbol: '',
    recipentAddress: '',
    transactionDate: '',
    transactionState: TransactionStates.SUCCESS
  };

  @Output() moduleClick = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  clickModule() {
    this.moduleClick.emit(this.transaction.txHash);
  }
}
