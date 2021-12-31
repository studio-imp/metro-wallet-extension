import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-fee-box',
  templateUrl: './fee-box.component.html',
  styleUrls: ['./fee-box.component.scss']
})
export class FeeBoxComponent implements OnInit {

  selectedBox: string = "normal";

  @Input() priorityGasPrice: string = '';
  @Input() baseGasPrice: string = '';

  @Input() estimatedTxFee: string = '~';

  
  customGasPrice: string = this.baseGasPrice;

  @Output() selectGasPrice: EventEmitter<string> = new EventEmitter();

  constructor() {

  }

  ngOnInit(): void {
  }

  setCustomGasPrice(gas: string) {
    this.customGasPrice = gas;
  }

  getBaseGasPrice() {
    return Number(this.baseGasPrice);
  }

  newCustomFee(event: any) {
    this.customGasPrice = event.target.value;
    this.selectFee('custom');
  }
  checkFeeValue(event: any) {
    event.target.value = this.customGasPrice;
  }

  selectFee(box: string) {
    this.selectedBox = box;
    
    switch(this.selectedBox) {
      case 'normal': {
        this.selectGasPrice.emit(this.baseGasPrice);
        break;
      }
      case 'quick': {
        this.selectGasPrice.emit(this.priorityGasPrice);
        break;
      }
      case 'custom': {
        if(Number(this.customGasPrice) < Number(this.baseGasPrice)) {
          this.customGasPrice = this.baseGasPrice;
        }
        this.selectGasPrice.emit(this.customGasPrice);
        break;
      }
    }
  }
}
