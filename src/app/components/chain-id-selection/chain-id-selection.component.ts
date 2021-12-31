import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-chain-id-selection',
  templateUrl: './chain-id-selection.component.html',
  styleUrls: ['./chain-id-selection.component.scss']
})
export class ChainIDSelectionComponent implements OnInit {

  @Input() currentChainID: number = 0;

  @Output() changeChainID: EventEmitter<number> = new EventEmitter<number>();


  customChainID: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

  selectNetworkRaw(chainID: number) {
    this.changeChainID.emit(chainID);
    console.log("Switched to: " + chainID);
  }
  selectNetwork(event: any) {
    this.changeChainID.emit(Number(event.target.value));
    console.log("Switched to: " + Number(event.target.value));
  }
  newCustomNetwork(event: any) {
    this.selectNetwork(event);
  }
}
