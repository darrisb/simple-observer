import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardWrapper } from './dashboard-wrapper';

describe('DashboardWrapper', () => {
  let component: DashboardWrapper;
  let fixture: ComponentFixture<DashboardWrapper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardWrapper],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardWrapper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
