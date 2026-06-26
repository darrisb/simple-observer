import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ReportAnalysisService, RuntimeErrorLog } from '../../services/report-analysis';

interface GroupedRuntimeError {
  key: string;
  message: string;
  file: string;
  count: number;
  earliestTime: string;
  latestTime: string;
  levels: string[];
  occurrences: RuntimeErrorLog[];
}

@Component({
  selector: 'app-dashboard-wrapper',
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    DataViewModule,
    SelectModule,
    DatePickerModule,
    InputTextModule,
    ButtonModule
  ],
  templateUrl: './dashboard-wrapper.html',
  styleUrl: './dashboard-wrapper.scss',
})
export class DashboardWrapper {
  private allErrors: RuntimeErrorLog[] = [];

  filteredErrors: RuntimeErrorLog[] = [];
  groupedErrors: GroupedRuntimeError[] = [];
  isLoading = true;

  search = '';
  level = '';
  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  readonly levelOptions = [
    { label: 'All Levels', value: '' },
    { label: 'Error', value: 'error' },
    { label: 'Warning', value: 'warning' },
    { label: 'Notice', value: 'notice' },
    { label: 'Exception', value: 'exception' },
  ];

  private readonly reportAnalysisService = inject(ReportAnalysisService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.getSystemLogs();
  }

  getSystemLogs(): void {
    this.isLoading = true;
    this.reportAnalysisService.getRuntimeLogs('errors', 500).subscribe({
      next: (data) => {
        this.allErrors = Array.isArray(data?.errors) ? data.errors : [];
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.allErrors = [];
        this.filteredErrors = [];
        this.groupedErrors = [];
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    const searchTerm = this.search.trim().toLowerCase();
    const fromTime = this.dateFrom ? this.toStartOfDay(this.dateFrom).getTime() : null;
    const toTime = this.dateTo ? this.toEndOfDay(this.dateTo).getTime() : null;

    this.filteredErrors = this.allErrors.filter((item) => {
      const itemTime = new Date(item.time).getTime();
      if (Number.isNaN(itemTime)) {
        return false;
      }

      if (fromTime !== null && itemTime < fromTime) {
        return false;
      }
      if (toTime !== null && itemTime > toTime) {
        return false;
      }
      if (this.level && item.level.toLowerCase() !== this.level.toLowerCase()) {
        return false;
      }

      if (!searchTerm) {
        return true;
      }

      return (
        item.message.toLowerCase().includes(searchTerm) ||
        item.file.toLowerCase().includes(searchTerm)
      );
    });
    this.groupedErrors = this.buildGroupedErrors(this.filteredErrors);
  }

  clearFilters(): void {
    this.search = '';
    this.level = '';
    this.dateFrom = null;
    this.dateTo = null;
    this.applyFilters();
  }

  get totalEvents(): number {
    return this.filteredErrors.length;
  }

  get totalGroups(): number {
    return this.groupedErrors.length;
  }

  private buildGroupedErrors(errors: RuntimeErrorLog[]): GroupedRuntimeError[] {
    const groupMap = new Map<string, GroupedRuntimeError>();

    errors.forEach((error) => {
      const key = `${error.message}|${error.file}`;
      const existing = groupMap.get(key);

      if (!existing) {
        groupMap.set(key, {
          key,
          message: error.message,
          file: error.file,
          count: 1,
          earliestTime: error.time,
          latestTime: error.time,
          levels: error.level ? [error.level] : [],
          occurrences: [error],
        });

        return;
      }

      existing.count += 1;
      existing.occurrences.push(error);

      if (this.toTimestamp(error.time) > this.toTimestamp(existing.latestTime)) {
        existing.latestTime = error.time;
      }

      if (this.toTimestamp(error.time) < this.toTimestamp(existing.earliestTime)) {
        existing.earliestTime = error.time;
      }

      if (error.level && !existing.levels.includes(error.level)) {
        existing.levels.push(error.level);
      }
    });

    const grouped = Array.from(groupMap.values());

    grouped.forEach((item) => {
      item.occurrences.sort((a, b) => this.toTimestamp(b.time) - this.toTimestamp(a.time));
      item.levels.sort((a, b) => a.localeCompare(b));
    });

    return grouped.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return this.toTimestamp(b.latestTime) - this.toTimestamp(a.latestTime);
    });
  }

  private toTimestamp(value: string): number {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? -Infinity : parsed;
  }

  private toStartOfDay(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0);
  }

  private toEndOfDay(value: Date): Date {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 23, 59, 59, 999);
  }
}
