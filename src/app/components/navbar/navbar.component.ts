import { Component, OnInit, Output, EventEmitter } from '@angular/core';



@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  @Output() sendTabClick = new EventEmitter();
  @Output() assetsTabClick = new EventEmitter();
  @Output() settingsTabClick = new EventEmitter();

  currentTab: string;

  constructor() {
    this.currentTab="sendTab"
  }

  ngOnInit(): void {
  }

  onSendTab() {
    this.sendTabClick.emit();
    this.currentTab="sendTab"
  }
  onAssetsTab() {
    this.assetsTabClick.emit();
    this.currentTab="assetsTab"
  }
  onSettingsTab() {
    this.settingsTabClick.emit();
    this.currentTab="settingsTab"
  }
}
