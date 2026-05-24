import { Component, inject } from '@angular/core';
import { LogViewing } from '../log-viewing/log-viewing';
import { ReportAnalysisService } from '../../services/report-analysis';

@Component({
  selector: 'app-dashboard-wrapper',
  imports: [LogViewing],
  templateUrl: './dashboard-wrapper.html',
  styleUrl: './dashboard-wrapper.scss',
})
export class DashboardWrapper {
  fullLogData: { errors: any[] } = { errors: [] };

  private readonly reportAnalysisService = inject(ReportAnalysisService);

  ngOnInit() {
    this.getSystemLogs();
  }

  getSystemLogs() {
    this.reportAnalysisService.getReportAnalysisFromApi().subscribe({
      next: (data: any) => {
        this.fullLogData = {
          errors: Array.isArray(data?.errors) ? data.errors : []
        };
      },
      error: () => {
        this.fullLogData = { errors: [] };
      }
    });
  }
}
