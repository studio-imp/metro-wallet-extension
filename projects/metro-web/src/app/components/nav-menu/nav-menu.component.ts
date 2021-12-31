import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent implements OnInit {
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
