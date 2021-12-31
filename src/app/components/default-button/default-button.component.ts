import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-default-button',
  templateUrl: './default-button.component.html',
  styleUrls: ['./default-button.component.scss']
})
export class DefaultButtonComponent implements OnInit {

  @Input() text: string;
  @Input() height: number;
  @Input() width: number;
  @Output() buttonClick = new EventEmitter();

  constructor() {
    this.text = "Button";
    this.height = 35;
    this.width = 100;
  }

  ngOnInit(): void {
  }

  onClick() {
    this.buttonClick.emit();
  }

}
