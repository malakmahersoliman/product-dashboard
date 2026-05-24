import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardData } from '../../models/dashboard.model';
import { ORDER_STATUS } from '../../models/order.model';
import { MOCK_DASHBOARD_DATA } from './dashboard.mock';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  dashboardData: DashboardData | null = null;

  readonly salesBars = [
    { label: 'Mon', value: 62 },
    { label: 'Tue', value: 78 },
    { label: 'Wed', value: 55 },
    { label: 'Thu', value: 88 },
    { label: 'Fri', value: 72 },
    { label: 'Sat', value: 95 },
    { label: 'Sun', value: 68 },
  ];

  ngOnInit(): void {
    // Mock load — replace with DashboardService.getDashboardData() later
    this.dashboardData = MOCK_DASHBOARD_DATA;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
}
