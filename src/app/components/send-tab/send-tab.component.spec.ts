import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendTabComponent } from './send-tab.component';

describe('SendTabComponent', () => {
  let component: SendTabComponent;
  let fixture: ComponentFixture<SendTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SendTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
