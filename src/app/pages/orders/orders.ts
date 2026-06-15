import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  PAYMENT_STATUS,
  ORDER_STATUS,
  OrderStatus,
  PaymentStatus,
  OrderSummary,
  OrderFilterRequest,
} from '../../models/order.model';
import { OrderService } from '../../services/order.service';
import { RouterLink } from '@angular/router';
import { Pagination } from '../../components/pagination/pagination';

type StatusFilter = 'All' | OrderStatus;
type PaymentStatusFilter = 'All' | PaymentStatus;


@Component({
  selector: 'app-orders',
  imports: [RouterLink, CommonModule, FormsModule, Pagination],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  orders: OrderSummary[] = [];
  searchTerm = '';
  statusFilter: StatusFilter = 'All';
  paymentStatusFilter: PaymentStatusFilter = 'All';

  readonly statusFilters: StatusFilter[] = [
    'All',
    ORDER_STATUS.pending,
    ORDER_STATUS.completed,
    ORDER_STATUS.cancelled,
  ];
  readonly paymentStatusFilters: PaymentStatusFilter[] = [
  'All',
  PAYMENT_STATUS.unpaid,
  PAYMENT_STATUS.paid,
  PAYMENT_STATUS.paymentFailed,
  PAYMENT_STATUS.refunded,
];

    customerNameFilter = '';

    pageNumber = 1;
    pageSize = 10;
    totalCount = 0;
    totalPages = 0;

    isLoading = false;
    ORDER_STATUS = ORDER_STATUS;
    PAYMENT_STATUS = PAYMENT_STATUS;
    errorMessage: string | null = null;
    updatingOrderId: number | null = null;

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }
    get totalOrdersCount(): number {
      return this.totalCount;
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

      const filter: OrderFilterRequest = {
        search: this.searchTerm.trim() || undefined,
        customerName: this.customerNameFilter.trim() || undefined,
        status: this.statusFilter === 'All' ? undefined : this.statusFilter,
        paymentStatus:
          this.paymentStatusFilter === 'All' ? undefined : this.paymentStatusFilter,
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        sortBy: 'orderDate',
        sortDirection: 'desc',
      };

      this.orderService.getOrders(filter).subscribe({
        next: (response) => {
          this.orders = response.items;
          this.pageNumber = response.pageNumber;
          this.pageSize = response.pageSize;
          this.totalCount = response.totalCount;
          this.totalPages = response.totalPages;

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
  this.pageNumber = 1;
  this.loadOrders();
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
    getPaymentStatusClass(paymentStatus: string | null | undefined): string {
    const status = paymentStatus || 'Unpaid';

    switch (status) {
      case 'Paid':
        return 'payment-badge payment-badge--paid';

      case 'Refunded':
        return 'payment-badge payment-badge--refunded';

      case 'PaymentFailed':
        return 'payment-badge payment-badge--failed';

      default:
        return 'payment-badge payment-badge--unpaid';
    }
  }
  getPaymentStatusLabel(paymentStatus: string | null | undefined): string {
    return paymentStatus || 'Unpaid';
  }
  setPaymentStatusFilter(filter: PaymentStatusFilter): void {
  this.paymentStatusFilter = filter;
  this.pageNumber = 1;
  this.loadOrders();
}
onSearchChanged(): void {
  this.pageNumber = 1;
  this.loadOrders();
}

resetFilters(): void {
  this.searchTerm = '';
  this.statusFilter = 'All';
  this.paymentStatusFilter = 'All';
  this.customerNameFilter = '';
  this.pageNumber = 1;
  this.loadOrders();
}

onPageChange(pageNumber: number): void {
  this.pageNumber = pageNumber;
  this.loadOrders();
}

onPageSizeChanged(): void {
  this.pageNumber = 1;
  this.loadOrders();
}
}
