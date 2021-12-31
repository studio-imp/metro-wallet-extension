import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalModuleComponent } from './modal-module.component';

describe('ModalModuleComponent', () => {
  let component: ModalModuleComponent;
  let fixture: ComponentFixture<ModalModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalModuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
