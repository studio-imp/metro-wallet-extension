import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-input-fancy',
  templateUrl: './input-fancy.component.html',
  styleUrls: ['./input-fancy.component.scss']
})
export class InputFancyComponent implements OnInit {

  @Input() inputType: string;
  @Input() placeholder: string;

  @Input() inputWidth: number;
  @Input() inputHeight: number;


  inputText: string = "";
  @Output() inputTextEvent = new EventEmitter<string>();

  constructor() {
    this.inputType = "number";
    this.placeholder = "add a placeholder u idiot";
    this.inputHeight = 28;
    this.inputWidth = 75;
  }

  ngOnInit(): void {
  }

  onInputKey(event: any) {
    this.inputText = event.target.value;
    //console.log(this.inputText);
    this.inputTextEvent.emit(this.inputText);
  }
}
