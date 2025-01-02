import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepoVesselComponent } from './repo-vessel.component';

describe('RepoVesselComponent', () => {
  let component: RepoVesselComponent;
  let fixture: ComponentFixture<RepoVesselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RepoVesselComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RepoVesselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
