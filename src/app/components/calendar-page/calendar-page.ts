import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { LogViewing } from '../log-viewing/log-viewing';
import { ReportAnalysisService, RuntimeErrorLog } from '../../services/report-analysis';

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CommonModule, LogViewing],
  templateUrl: './calendar-page.html',
  styleUrl: './calendar-page.scss',
})
export class CalendarPage implements OnInit {
  private readonly reportAnalysisService = inject(ReportAnalysisService);
  private readonly cdr = inject(ChangeDetectorRef);

  errors: RuntimeErrorLog[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.reportAnalysisService.getRuntimeLogs('errors', 500).subscribe({
      next: (payload) => {
        this.errors = payload.errors;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errors = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
