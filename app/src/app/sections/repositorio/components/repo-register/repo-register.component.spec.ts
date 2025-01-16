import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepoRegisterComponent } from './repo-register.component';

describe('RepoRegisterComponent', () => {
  let component: RepoRegisterComponent;
  let fixture: ComponentFixture<RepoRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RepoRegisterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RepoRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
