import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewConnectionInfoComponent } from './view-connection-info.component';

describe('ViewConnectionInfoComponent', () => {
  let component: ViewConnectionInfoComponent;
  let fixture: ComponentFixture<ViewConnectionInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewConnectionInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewConnectionInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
