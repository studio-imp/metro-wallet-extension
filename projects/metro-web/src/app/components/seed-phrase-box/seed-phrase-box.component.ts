import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { generateMnemonic } from 'bip39';
@Component({
  selector: 'app-seed-phrase-box',
  templateUrl: './seed-phrase-box.component.html',
  styleUrls: ['./seed-phrase-box.component.scss']
})
export class SeedPhraseBoxComponent implements OnInit {

  seedPhrase: string[] = [''];

  @Output() generatedSeedphrase: EventEmitter<string> = new EventEmitter<string>();


  constructor() {
    this.seedPhrase = generateMnemonic(256).split(' ');
    this.generatedSeedphrase.emit(this.seedPhrase.join(' '));
  }

  ngOnInit(): void {
    this.generatedSeedphrase.emit(this.seedPhrase.join(' '));
  }

}
