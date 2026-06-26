import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DialogModule } from 'primeng/dialog';

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

type HeatLevel = 'none' | 'low' | 'medium' | 'high' | 'critical' | 'future';

interface HeatmapCell {
  key: string;
  date: Date;
  count: number;
  level: HeatLevel;
  isToday: boolean;
  isFuture: boolean;
  tooltip: string;
}

interface HeatmapWeek {
  key: string;
  monthLabel: string;
  cells: HeatmapCell[];
}

@Component({
  selector: 'app-log-viewing',
  standalone: true,
  imports: [CommonModule, RouterLink, DialogModule],
  templateUrl: './log-viewing.html',
  styleUrl: './log-viewing.scss',
})
export class LogViewing {
  private readonly dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  private readonly monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
  private readonly heatmapWeeksToShow = 12;

  private errorsByDate = new Map<string, DashboardError[]>();

  @Input()
  set errors(value: DashboardError[] | null | undefined) {
    const safeErrors = Array.isArray(value) ? value : [];
    this.rebuildErrorMap(safeErrors);

    if (this.selectedDate) {
      this.loadDateDetails(this.selectedDate);
    }

    this.rebuildHeatmap();
  }

  selectedDate: Date = new Date();
  showDetailsDialog = false;
  selectedDateLabel = '';
  selectedDayErrors: GroupedDayError[] = [];
  selectedDayRawCount = 0;
  showUpgradeBadge = false;
  readonly weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  heatmapWeeks: HeatmapWeek[] = [];

  constructor() {
    this.rebuildHeatmap();
  }

  handleDateSelection(cell: HeatmapCell): void {
    if (cell.isFuture) {
      return;
    }

    this.selectedDate = cell.date;
    this.loadDateDetails(cell.date);
    this.showDetailsDialog = true;
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

  private rebuildHeatmap(): void {
    const today = this.startOfDay(new Date());
    const currentWeekStart = this.startOfDay(new Date(today));
    currentWeekStart.setDate(today.getDate() - today.getDay());

    const firstWeekStart = this.startOfDay(new Date(currentWeekStart));
    firstWeekStart.setDate(currentWeekStart.getDate() - (this.heatmapWeeksToShow - 1) * 7);

    const weeks: HeatmapWeek[] = [];

    for (let weekIndex = 0; weekIndex < this.heatmapWeeksToShow; weekIndex += 1) {
      const weekStart = this.startOfDay(new Date(firstWeekStart));
      weekStart.setDate(firstWeekStart.getDate() + weekIndex * 7);

      const weekCells: HeatmapCell[] = [];

      for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
        const cellDate = this.startOfDay(new Date(weekStart));
        cellDate.setDate(weekStart.getDate() + dayOffset);

        const dateKey = this.toDateKey(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
        const isFuture = cellDate.getTime() > today.getTime();
        const count = isFuture ? 0 : (this.errorsByDate.get(dateKey)?.length ?? 0);

        weekCells.push({
          key: dateKey,
          date: cellDate,
          count,
          level: isFuture ? 'future' : this.toHeatLevel(count),
          isToday: cellDate.getTime() === today.getTime(),
          isFuture,
          tooltip: `${this.dateFormatter.format(cellDate)}: ${count} errors`,
        });
      }

      weeks.push({
        key: this.toDateKey(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()),
        monthLabel: this.getMonthLabelForWeek(weekCells, weekIndex),
        cells: weekCells,
      });
    }

    this.heatmapWeeks = weeks;
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

  private getMonthLabelForWeek(cells: HeatmapCell[], weekIndex: number): string {
    const firstOfMonthCell = cells.find((cell) => !cell.isFuture && cell.date.getDate() === 1);
    if (firstOfMonthCell) {
      return this.monthFormatter.format(firstOfMonthCell.date);
    }

    if (weekIndex === 0) {
      return this.monthFormatter.format(cells[0].date);
    }

    return '';
  }

  private toHeatLevel(count: number): HeatLevel {
    if (count === 0) {
      return 'none';
    }
    if (count <= 2) {
      return 'low';
    }
    if (count <= 5) {
      return 'medium';
    }
    if (count <= 9) {
      return 'high';
    }

    return 'critical';
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  }

  private toDateKey(year: number, monthIndex: number, day: number): string {
    const normalizedDate = new Date(year, monthIndex, day);
    const month = String(normalizedDate.getMonth() + 1).padStart(2, '0');
    const dayValue = String(normalizedDate.getDate()).padStart(2, '0');

    return `${normalizedDate.getFullYear()}-${month}-${dayValue}`;
  }
}
