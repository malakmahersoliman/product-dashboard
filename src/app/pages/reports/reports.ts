import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesReport } from '../../models/report.model';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports {
  private reportService = inject(ReportService);
  private cdr = inject(ChangeDetectorRef);

  fromDate = this.startOfMonthIso();
  toDate = this.todayIso();

  report: SalesReport | null = null;
  generatedAt: Date | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  validationMessage: string | null = null;

  generateReport(): void {
    this.validationMessage = null;
    this.errorMessage = null;

    if (!this.fromDate || !this.toDate) {
      this.validationMessage = 'Please select both start and end dates.';
      return;
    }

    if (this.fromDate > this.toDate) {
      this.validationMessage = 'Start date must be on or before end date.';
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    this.reportService.getSalesReport(this.fromDate, this.toDate).subscribe({
      next: (response) => {
        this.report = response;
        this.generatedAt = new Date();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.report = null;
        this.generatedAt = null;
        this.errorMessage = 'Unable to generate the sales report. Please try again.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  printReport(): void {
    if (!this.report) {
      return;
    }

    window.print();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatReportDate(dateString: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  }

  formatShortDate(dateString: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(dateString));
  }

  formatGeneratedAt(date: Date): string {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  }

  private startOfMonthIso(): string {
    const now = new Date();
    return this.toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
  }

  private todayIso(): string {
    return this.toIsoDate(new Date());
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
