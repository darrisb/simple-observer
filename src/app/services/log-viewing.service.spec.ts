import { TestBed } from '@angular/core/testing';

import { LogViewingServiceTs } from './log-viewing.service.ts';

describe('LogViewingServiceTs', () => {
  let service: LogViewingServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogViewingServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
