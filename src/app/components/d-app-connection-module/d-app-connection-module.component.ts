import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-d-app-connection-module',
  templateUrl: './d-app-connection-module.component.html',
  styleUrls: ['./d-app-connection-module.component.scss']
})
export class DAppConnectionModuleComponent implements OnInit {

  @Input() url: string = '';
  @Input() siteFavicon: string = '';
  @Input() tabId: number = 0;

  @Output() moduleClick = new EventEmitter<Number>();


  constructor() { }

  ngOnInit(): void {
  }

  clickModule() {
    this.moduleClick.emit(this.tabId);
  }
}
