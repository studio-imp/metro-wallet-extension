import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnlockWalletPageComponent } from './unlock-wallet-page.component';

describe('UnlockWalletPageComponent', () => {
  let component: UnlockWalletPageComponent;
  let fixture: ComponentFixture<UnlockWalletPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnlockWalletPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnlockWalletPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
