import { Component, Input, OnInit } from '@angular/core';
import { generateMnemonic } from 'bip39';
@Component({
  selector: 'app-seed-phrase-box',
  templateUrl: './seed-phrase-box.component.html',
  styleUrls: ['./seed-phrase-box.component.scss']
})
export class SeedPhraseBoxComponent implements OnInit {

  seedPhrase: string[] = [''];

  constructor() {
    this.seedPhrase = generateMnemonic(256).split(' ');
  }

  ngOnInit(): void {
  }

}
