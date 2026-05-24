import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ORDER_STATUS, OrderStatus, OrderSummary } from '../../models/order.model';
import { OrderService } from '../../services/order.service';
import { RouterLink } from '@angular/router';

type StatusFilter = 'All' | OrderStatus;

@Component({
  selector: 'app-orders',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  orders: OrderSummary[] = [];
  searchTerm = '';
  statusFilter: StatusFilter = 'All';
  isLoading = false;
  ORDER_STATUS = ORDER_STATUS;
  errorMessage: string | null = null;
  updatingOrderId: number | null = null;

  readonly statusFilters: StatusFilter[] = [
    'All',
    ORDER_STATUS.pending,
    ORDER_STATUS.completed,
    ORDER_STATUS.cancelled,
  ];

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  get filteredOrders(): OrderSummary[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.orders.filter((order) => {
      const matchesStatus =
        this.statusFilter === 'All' || order.status === this.statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      return (
        order.customerName.toLowerCase().includes(term) ||
        order.id.toString().includes(term)
      );
    });
  }

  get totalOrdersCount(): number {
    return this.orders.length;
  }

  get pendingCount(): number {
    return this.orders.filter((o) => o.status === ORDER_STATUS.pending).length;
  }

  get completedCount(): number {
    return this.orders.filter((o) => o.status === ORDER_STATUS.completed).length;
  }

  get cancelledCount(): number {
    return this.orders.filter((o) => o.status === ORDER_STATUS.cancelled).length;
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.orderService.getOrders().subscribe({
      next: (response) => {
        this.orders = response;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to load orders. Please try again later.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  setStatusFilter(filter: StatusFilter): void {
    this.statusFilter = filter;
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

  canComplete(order: OrderSummary): boolean {
    return order.status === ORDER_STATUS.pending;
  }

  canCancel(order: OrderSummary): boolean {
    return order.status === ORDER_STATUS.pending;
  }

  orderTotal(order: OrderSummary): number {
    return order.totalAmount;
  }

  itemCount(order: OrderSummary): number {
    return order.itemCount;
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

  onUpdateStatus(id: number, status: OrderStatus): void {
    this.updatingOrderId = id;
    this.errorMessage = null;

    this.orderService.updateOrderStatus(id, status).subscribe({
      next: () => {
        const order = this.orders.find((o) => o.id === id);
        if (order) {
          order.status = status;
        }
        this.updatingOrderId = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to update order status.';
        this.updatingOrderId = null;
        this.cdr.markForCheck();
      },
    });
  }

  onDeleteOrder(id: number): void {
    const confirmed = confirm('Are you sure you want to delete this order?');

    if (!confirmed) {
      return;
    }

    this.errorMessage = null;

    this.orderService.deleteOrder(id).subscribe({
      next: () => {
        this.orders = this.orders.filter((order) => order.id !== id);
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to delete order.';
        this.cdr.markForCheck();
      },
    });
  }
}
