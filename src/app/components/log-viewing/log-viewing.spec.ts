import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogViewing } from './log-viewing';

describe('LogViewing', () => {
  let component: LogViewing;
  let fixture: ComponentFixture<LogViewing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogViewing],
    }).compileComponents();

    fixture = TestBed.createComponent(LogViewing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
