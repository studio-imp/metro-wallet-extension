import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewTokenComponent } from './add-new-token.component';

describe('AddNewTokenComponent', () => {
  let component: AddNewTokenComponent;
  let fixture: ComponentFixture<AddNewTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddNewTokenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNewTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
