import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectPopupComponent } from './connect-popup.component';

describe('ConnectPopupComponent', () => {
  let component: ConnectPopupComponent;
  let fixture: ComponentFixture<ConnectPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
