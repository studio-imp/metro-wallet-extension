import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-pincode-input',
  templateUrl: './pincode-input.component.html',
  styleUrls: ['./pincode-input.component.scss']
})
export class PincodeInputComponent implements OnInit {


  @Input() inputType: string;
  @Input() placeholder: string;

  @Input() pinBoxWidth: number;
  @Input() pinBoxHeight: number;

  

  inputText: string[] = [];
  @Output() inputTextEvent = new EventEmitter<string[]>();



  constructor() {


    this.inputType = "number";
    this.placeholder = "add a placeholder u idiot";
    this.pinBoxHeight = 28;
    this.pinBoxWidth = 75;
  }

  onInputKey(event: any, nextField: string) {

    if(event.keyCode == 8) {
      if(Number(nextField) - 2 > 1) {
        document.getElementById((Number(nextField) - 2).toString())?.focus();
      }else {
        document.getElementById('1')?.focus();
      }
    }

    if(event.target.value != "") {
      if(event.target.value.match(/^[0-9]+$/) == null) {
        alert("Only digits allowed!");
        event.target.value = "";
        return;
      }
      if(Number(nextField) <= 6) {
        document.getElementById(nextField)?.focus();
      }
    }

      this.inputText[Number(nextField) - 1] = event.target.value;
      this.inputTextEvent.emit(this.inputText);
  }

  ngOnInit(): void {
  }
}
