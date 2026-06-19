import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ReportAnalysisService, RuntimeErrorLog } from '../../services/report-analysis';

interface StatItem {
  label: string;
  value: string;
}

interface GroupedErrorItem {
  key: string;
  message: string;
  file: string;
  count: number;
  latestTime: string;
}

@Component({
  selector: 'app-overview-page',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './overview-page.html',
  styleUrl: './overview-page.scss',
})
export class OverviewPage implements OnInit {
  private readonly reportAnalysisService = inject(ReportAnalysisService);
  private readonly cdr = inject(ChangeDetectorRef);

  isLoading = true;
  loadError = '';
  errors: RuntimeErrorLog[] = [];
  summary: StatItem[] = [];
  groupedErrors: GroupedErrorItem[] = [];
  recentErrors: RuntimeErrorLog[] = [];

  ngOnInit(): void {
    this.loadOverview();
  }

  private loadOverview(): void {
    this.isLoading = true;
    this.loadError = '';

    this.reportAnalysisService.getRuntimeLogs('errors', 500).subscribe({
      next: (payload) => {
        this.errors = payload.errors;
        this.summary = this.buildSummary(payload.errors);
        this.groupedErrors = this.buildGroupedErrors(payload.errors);
        this.recentErrors = payload.errors.slice(0, 10);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errors = [];
        this.summary = this.buildSummary([]);
        this.groupedErrors = [];
        this.recentErrors = [];
        this.loadError = 'Unable to load runtime overview.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private buildSummary(errors: RuntimeErrorLog[]): StatItem[] {
    const uniqueGroups = new Set(errors.map((item) => `${item.message}|${item.file}`)).size;
    const aiReady = errors.filter((item) => !!item.ai_explanation).length;
    const lastError = errors[0]?.time ?? '';

    return [
      { label: 'Total Error Events', value: String(errors.length) },
      { label: 'Unique Error Groups', value: String(uniqueGroups) },
      { label: 'AI-Explained Errors', value: String(aiReady) },
      { label: 'Last Error Time', value: lastError || 'No errors found' },
    ];
  }

  private buildGroupedErrors(errors: RuntimeErrorLog[]): GroupedErrorItem[] {
    const groups = new Map<string, GroupedErrorItem>();

    errors.forEach((item) => {
      const key = `${item.message}|${item.file}`;
      const existing = groups.get(key);

      if (!existing) {
        groups.set(key, {
          key,
          message: item.message,
          file: item.file,
          count: 1,
          latestTime: item.time,
        });
        return;
      }

      existing.count += 1;
      if (item.time > existing.latestTime) {
        existing.latestTime = item.time;
      }
    });

    return Array.from(groups.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }
}
