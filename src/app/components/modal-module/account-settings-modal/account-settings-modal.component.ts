import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-account-settings-modal',
  templateUrl: './account-settings-modal.component.html',
  styleUrls: ['./account-settings-modal.component.scss']
})
export class AccountSettingsModalComponent implements OnInit {


  @Input() accountAddress: string = "Loading";
  @Input() avaxBalance: string = "0";
  @Input() accountIndex: number = 0;


  @Output() closeModalButton = new EventEmitter();

  @Output() switchToNextAccount = new EventEmitter();
  @Output() switchToPreviousAccount = new EventEmitter();



  constructor() { }

  ngOnInit(): void {
  }

  nextAccount() {
    this.switchToNextAccount.emit();
  }
  previousAccount() {
    this.switchToPreviousAccount.emit();
  }
  closeModal() {
    this.closeModalButton.emit();
  }
}
