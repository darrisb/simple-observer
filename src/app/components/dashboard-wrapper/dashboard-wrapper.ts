import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { TableModule } from 'primeng/table';
import { ReportAnalysisService, RuntimeErrorLog } from '../../services/report-analysis';

@Component({
  selector: 'app-dashboard-wrapper',
  imports: [CommonModule, FormsModule, DatePipe, TableModule, DrawerModule],
  templateUrl: './dashboard-wrapper.html',
  styleUrl: './dashboard-wrapper.scss',
})
export class DashboardWrapper {
  private allErrors: RuntimeErrorLog[] = [];

  filteredErrors: RuntimeErrorLog[] = [];
  selected: RuntimeErrorLog | null = null;
  detailVisible = false;
  isLoading = true;

  search = '';
  level = '';
  dateFrom = '';
  dateTo = '';

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
        this.selected = null;
        this.detailVisible = false;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    const searchTerm = this.search.trim().toLowerCase();
    const fromTime = this.dateFrom ? new Date(this.dateFrom).getTime() : null;
    const toTime = this.dateTo ? new Date(this.dateTo + 'T23:59:59').getTime() : null;

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

    this.selected = this.filteredErrors.length > 0 ? this.filteredErrors[0] : null;
    if (this.selected === null) {
      this.detailVisible = false;
    }
  }

  clearFilters(): void {
    this.search = '';
    this.level = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.applyFilters();
  }

  openDetails(row: RuntimeErrorLog): void {
    this.selected = row;
    this.detailVisible = true;
  }

  get total(): number {
    return this.filteredErrors.length;
  }
}
