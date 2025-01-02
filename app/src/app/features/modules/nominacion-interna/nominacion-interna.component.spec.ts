import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NominacionInternaComponent } from './nominacion-interna.component';

describe('NominacionInternaComponent', () => {
  let component: NominacionInternaComponent;
  let fixture: ComponentFixture<NominacionInternaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NominacionInternaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NominacionInternaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
