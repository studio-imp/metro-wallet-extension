import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChainIDSelectionComponent } from './chain-id-selection.component';

describe('ChainIDSelectionComponent', () => {
  let component: ChainIDSelectionComponent;
  let fixture: ComponentFixture<ChainIDSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChainIDSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChainIDSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
