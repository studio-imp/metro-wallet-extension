import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeeBoxComponent } from './fee-box.component';

describe('FeeBoxComponent', () => {
  let component: FeeBoxComponent;
  let fixture: ComponentFixture<FeeBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeeBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeeBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
