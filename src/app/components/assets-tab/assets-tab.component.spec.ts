import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsTabComponent } from './assets-tab.component';

describe('AssetsTabComponent', () => {
  let component: AssetsTabComponent;
  let fixture: ComponentFixture<AssetsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetsTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
