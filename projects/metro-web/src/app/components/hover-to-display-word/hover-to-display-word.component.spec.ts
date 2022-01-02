import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoverToDisplayWordComponent } from './hover-to-display-word.component';

describe('HoverToDisplayWordComponent', () => {
  let component: HoverToDisplayWordComponent;
  let fixture: ComponentFixture<HoverToDisplayWordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HoverToDisplayWordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HoverToDisplayWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
