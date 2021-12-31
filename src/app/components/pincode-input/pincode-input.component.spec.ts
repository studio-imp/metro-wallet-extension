import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PincodeInputComponent } from './pincode-input.component';

describe('PincodeInputComponent', () => {
  let component: PincodeInputComponent;
  let fixture: ComponentFixture<PincodeInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PincodeInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PincodeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
