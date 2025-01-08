import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidacionEmbarqueComponent } from './liquidacion-embarque.component';

describe('LiquidacionEmbarqueComponent', () => {
  let component: LiquidacionEmbarqueComponent;
  let fixture: ComponentFixture<LiquidacionEmbarqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LiquidacionEmbarqueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LiquidacionEmbarqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
