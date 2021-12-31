import { Component, OnInit, Output,EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-view-connection-info',
  templateUrl: './view-connection-info.component.html',
  styleUrls: ['./view-connection-info.component.scss']
})
export class ViewConnectionInfoComponent implements OnInit {


  @Output() closeModalButton = new EventEmitter();
  @Output() deleteConnectionButton = new EventEmitter<number>();

  @Input() port: any;


  constructor() { }

  ngOnInit(): void {
  }

  closeModal() {
    this.closeModalButton.emit();
  }

  deleteConnection() {
    this.deleteConnectionButton.emit(this.port.sender.tab.id);
  }

}
