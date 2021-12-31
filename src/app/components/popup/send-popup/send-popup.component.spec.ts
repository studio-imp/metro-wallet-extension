import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendPopupComponent } from './send-popup.component';

describe('SendPopupComponent', () => {
  let component: SendPopupComponent;
  let fixture: ComponentFixture<SendPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SendPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
