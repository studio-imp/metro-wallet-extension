import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TxHistoryModuleComponent } from './tx-history-module.component';

describe('TxHistoryModuleComponent', () => {
  let component: TxHistoryModuleComponent;
  let fixture: ComponentFixture<TxHistoryModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TxHistoryModuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TxHistoryModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
