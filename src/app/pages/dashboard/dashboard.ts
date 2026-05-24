import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatisticsResponse } from '../../models/statistics.model';
import { StatisticsService } from '../../services/statistics.service';

interface OverviewBar {
  label: string;
  value: number;
  count: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private statisticsService = inject(StatisticsService);
  private cdr = inject(ChangeDetectorRef);

  statistics: StatisticsResponse | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    this.statisticsService.getStatistics().subscribe({
      next: (response) => {
        this.statistics = response;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Unable to load statistics. Please try again.';
        this.statistics = null;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  get orderOverviewBars(): OverviewBar[] {
    if (!this.statistics) {
      return [];
    }

    const { pending, completed, cancelled, total } = this.statistics.orders;
    const max = Math.max(pending, completed, cancelled, total, 1);

    return [
      { label: 'Pending', value: (pending / max) * 100, count: pending },
      { label: 'Completed', value: (completed / max) * 100, count: completed },
      { label: 'Cancelled', value: (cancelled / max) * 100, count: cancelled },
      { label: 'Total', value: (total / max) * 100, count: total },
    ];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}
