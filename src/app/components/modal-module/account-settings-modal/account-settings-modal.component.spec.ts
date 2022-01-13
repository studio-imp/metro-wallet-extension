import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSettingsModalComponent } from './account-settings-modal.component';

describe('AccountSettingsModalComponent', () => {
  let component: AccountSettingsModalComponent;
  let fixture: ComponentFixture<AccountSettingsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountSettingsModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountSettingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
