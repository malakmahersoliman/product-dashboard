import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { StatisticsResponse } from '../../models/statistics.model';
import { OrderSummary, ORDER_STATUS } from '../../models/order.model';
import { Product } from '../../models/product.model';
import { StatisticsService } from '../../services/statistics.service';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';

interface OverviewBar {
  label: string;
  value: number;
  count: number;
  tone: 'pending' | 'completed' | 'cancelled' | 'total';
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private statisticsService = inject(StatisticsService);
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);

  statistics: StatisticsResponse | null = null;
  recentOrders: OrderSummary[] = [];
  lowStockProducts: Product[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    forkJoin({
      statistics: this.statisticsService.getStatistics(),
      recentOrders: this.orderService.getOrders({
        pageNumber: 1,
        pageSize: 5,
        sortBy: 'orderDate',
        sortDirection: 'desc',
      }),
      lowStockProducts: this.productService.getProducts({
        pageNumber: 1,
        pageSize: 5,
        stockStatus: 'lowStock',
        sortBy: 'stock',
        sortDirection: 'asc',
      }),
    }).subscribe({
      next: ({ statistics, recentOrders, lowStockProducts }) => {
        this.statistics = statistics;
        this.recentOrders = recentOrders.items;
        this.lowStockProducts = lowStockProducts.items;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Unable to load dashboard data. Please try again.';
        this.statistics = null;
        this.recentOrders = [];
        this.lowStockProducts = [];
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
    const max = Math.max(pending, completed, cancelled, 1);

    return [
      { label: 'Pending', value: (pending / max) * 100, count: pending, tone: 'pending' },
      { label: 'Completed', value: (completed / max) * 100, count: completed, tone: 'completed' },
      { label: 'Cancelled', value: (cancelled / max) * 100, count: cancelled, tone: 'cancelled' },
    ];
  }

  get completionRate(): number {
    if (!this.statistics || this.statistics.orders.total === 0) {
      return 0;
    }

    return Math.round(
      (this.statistics.orders.completed / this.statistics.orders.total) * 100,
    );
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(dateString));
  }

  getStatusClass(status: string): string {
    switch (status) {
      case ORDER_STATUS.completed:
        return 'status-completed';
      case ORDER_STATUS.cancelled:
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  }

  stockLevelClass(stock: number): string {
    if (stock <= 0) {
      return 'stock-critical';
    }

    return 'meta-value--low';
  }
}
