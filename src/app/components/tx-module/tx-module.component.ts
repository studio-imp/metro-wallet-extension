import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { IMetroToken } from 'src/metro_backend/tokens';

@Component({
  selector: 'app-tx-module',
  templateUrl: './tx-module.component.html',
  styleUrls: ['./tx-module.component.scss']
})
export class TxModuleComponent implements OnInit {

  @Input() tokenLabel: string = "";
  @Input() tokenAmount: number = 0;
  @Input() tokenImgURI: string = "https://snowtrace.io/images/main/empty-token.png";

  @Input() tokenInfo: IMetroToken = {
    tokenName: '',
    tokenSymbol: '',
    tokenAddress: '',
    tokenDecimals: 0,
    tokenBalance: 0,
    tokenLogoURI: 'https://snowtrace.io/images/main/empty-token.png'
  };

  @Output() moduleClick = new EventEmitter<IMetroToken>();

  constructor() { }

  ngOnInit(): void {
  }

  clickModule() {
    this.moduleClick.emit(this.tokenInfo);
  }

}
