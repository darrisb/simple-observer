import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { ApiService } from '../../services/api.service';

interface DashboardError {
  _id?: string;
  message: string;
  file: string;
  time: string;
  ai_explanation?: string;
}

interface GroupedDayError {
  message: string;
  file: string;
  count: number;
  latestTime: string;
  hasFix: boolean;
}

interface CalendarBannerResponse {
  available?: boolean;
  enabled?: boolean;
  imageSrc?: string;
  src?: string;
  data?: {
    available?: boolean;
    enabled?: boolean;
    imageSrc?: string;
    src?: string;
  };
}

@Component({
  selector: 'app-log-viewing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePickerModule, DialogModule],
  templateUrl: './log-viewing.html',
  styleUrl: './log-viewing.scss',
})
export class LogViewing implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  private errorsByDate = new Map<string, DashboardError[]>();

  @Input()
  set errors(value: DashboardError[] | null | undefined) {
    const safeErrors = Array.isArray(value) ? value : [];
    this.rebuildErrorMap(safeErrors);

    if (this.selectedDate) {
      this.loadDateDetails(this.selectedDate);
    }
  }

  selectedDate: Date = new Date();
  showDetailsDialog = false;
  selectedDateLabel = '';
  selectedDayErrors: GroupedDayError[] = [];
  selectedDayRawCount = 0;
  showUpgradeBadge = false;

  ngOnInit(): void {
    this.checkProAvailability();
  }

  handleDateSelection(date: Date): void {
    this.selectedDate = date;
    this.loadDateDetails(date);
    this.showDetailsDialog = true;
  }

  hasErrorsOnTemplateDate(date: any): boolean {
    return this.getErrorCountForTemplateDate(date) > 0;
  }

  getErrorCountForTemplateDate(date: any): number {
    const dateKey = this.getTemplateDateKey(date);
    if (!dateKey) {
      return 0;
    }

    return this.errorsByDate.get(dateKey)?.length ?? 0;
  }

  private loadDateDetails(date: Date): void {
    const dateKey = this.toDateKey(date.getFullYear(), date.getMonth(), date.getDate());
    const dayErrors = this.errorsByDate.get(dateKey) ?? [];

    this.selectedDayRawCount = dayErrors.length;
    this.selectedDayErrors = this.groupErrors(dayErrors);
    this.selectedDateLabel = this.dateFormatter.format(date);
  }

  private rebuildErrorMap(errors: DashboardError[]): void {
    this.errorsByDate = new Map<string, DashboardError[]>();

    errors.forEach((item) => {
      const parsedDate = new Date(item.time);

      if (Number.isNaN(parsedDate.getTime())) {
        return;
      }

      const key = this.toDateKey(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
      const existing = this.errorsByDate.get(key) ?? [];

      existing.push(item);
      this.errorsByDate.set(key, existing);
    });
  }

  private groupErrors(errors: DashboardError[]): GroupedDayError[] {
    const groupMap = new Map<string, GroupedDayError>();

    errors.forEach((error) => {
      const key = `${error.message}|${error.file}`;
      const existing = groupMap.get(key);

      if (!existing) {
        groupMap.set(key, {
          message: error.message,
          file: error.file,
          count: 1,
          latestTime: error.time,
          hasFix: !!error.ai_explanation,
        });

        return;
      }

      existing.count += 1;
      existing.latestTime = error.time > existing.latestTime ? error.time : existing.latestTime;
      existing.hasFix = existing.hasFix || !!error.ai_explanation;
    });

    return Array.from(groupMap.values()).sort((a, b) => b.count - a.count);
  }

  private getTemplateDateKey(templateDate: any): string | null {
    const day = Number(templateDate?.day);
    const month = Number(templateDate?.month);
    const year = Number(templateDate?.year);

    if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
      return null;
    }

    // PrimeNG date templates expose 0-based month indexes.
    return this.toDateKey(year, month, day);
  }

  private toDateKey(year: number, monthIndex: number, day: number): string {
    const normalizedDate = new Date(year, monthIndex, day);
    const month = String(normalizedDate.getMonth() + 1).padStart(2, '0');
    const dayValue = String(normalizedDate.getDate()).padStart(2, '0');

    return `${normalizedDate.getFullYear()}-${month}-${dayValue}`;
  }

  private checkProAvailability(): void {
    this.apiService.get<any>('api/pro/availability').subscribe({
      next: (response) => {
        this.showUpgradeBadge = Boolean(
          response?.available ?? response?.proAvailable ?? response?.data?.available
        );
      },
      error: () => {
        // Hide upgrade prompts until backend explicitly marks pro as available.
        this.showUpgradeBadge = false;
      }
    });
  }
}
