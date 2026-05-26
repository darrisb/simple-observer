import { TestBed } from '@angular/core/testing';

import { ReportAnalysisService } from './report-analysis';

describe('ReportAnalysisService', () => {
  let service: ReportAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
