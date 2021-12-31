import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss']
})
export class ToggleButtonComponent implements OnInit {

  @Input() isSelected: boolean = false;

  @Input() text: string;
  @Output() buttonClick = new EventEmitter();

  constructor() {
    this.text = "Button";
  }

  ngOnInit(): void {
  }

  onClick() {
    this.isSelected = true;
    this.buttonClick.emit();
  }
}
