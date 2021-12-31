import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectAssetComponent } from './select-asset.component';

describe('SelectAssetComponent', () => {
  let component: SelectAssetComponent;
  let fixture: ComponentFixture<SelectAssetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectAssetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectAssetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
