import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-hover-to-display-word',
  templateUrl: './hover-to-display-word.component.html',
  styleUrls: ['./hover-to-display-word.component.scss']
})
export class HoverToDisplayWordComponent implements OnInit {

  @Input() index: string = '';
  @Input() word: string = '';

  wordToDisplay: string = '~';

  constructor() { }

  ngOnInit(): void {
  }

  shouldDisplayWord(state: boolean) {
    if(state == true) {
      this.wordToDisplay = this.word;
      return;
    }
    this.wordToDisplay = '~';
  }
}
