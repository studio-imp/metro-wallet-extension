import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationModuleComponent } from './notification-module.component';

describe('NotificationModuleComponent', () => {
  let component: NotificationModuleComponent;
  let fixture: ComponentFixture<NotificationModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotificationModuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
