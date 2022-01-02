import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeedPhraseBoxComponent } from './seed-phrase-box.component';

describe('SeedPhraseBoxComponent', () => {
  let component: SeedPhraseBoxComponent;
  let fixture: ComponentFixture<SeedPhraseBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeedPhraseBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeedPhraseBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
