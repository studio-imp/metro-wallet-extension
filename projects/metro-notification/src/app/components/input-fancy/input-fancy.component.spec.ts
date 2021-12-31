import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputFancyComponent } from './input-fancy.component';

describe('InputFancyComponent', () => {
  let component: InputFancyComponent;
  let fixture: ComponentFixture<InputFancyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputFancyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputFancyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
