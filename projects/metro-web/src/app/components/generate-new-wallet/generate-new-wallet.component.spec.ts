import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateNewWalletComponent } from './generate-new-wallet.component';

describe('GenerateNewWalletComponent', () => {
  let component: GenerateNewWalletComponent;
  let fixture: ComponentFixture<GenerateNewWalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerateNewWalletComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateNewWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
