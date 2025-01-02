import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistribucionEmbarqueComponent } from './distribucion-embarque.component';

describe('DistribucionEmbarqueComponent', () => {
  let component: DistribucionEmbarqueComponent;
  let fixture: ComponentFixture<DistribucionEmbarqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DistribucionEmbarqueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DistribucionEmbarqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
