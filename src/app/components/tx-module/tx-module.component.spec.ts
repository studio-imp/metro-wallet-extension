import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TxModuleComponent } from './tx-module.component';

describe('TxModuleComponent', () => {
  let component: TxModuleComponent;
  let fixture: ComponentFixture<TxModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TxModuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TxModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
