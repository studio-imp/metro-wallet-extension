import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DAppConnectionModuleComponent } from './d-app-connection-module.component';

describe('DAppConnectionModuleComponent', () => {
  let component: DAppConnectionModuleComponent;
  let fixture: ComponentFixture<DAppConnectionModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DAppConnectionModuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DAppConnectionModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
