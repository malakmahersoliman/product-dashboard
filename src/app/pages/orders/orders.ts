import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { ListFilterPanel } from '../../components/list-filter-panel/list-filter-panel';
import {
  FilterValues,
  ListFilterField,
  ListFilterSearchEvent,
} from '../../components/list-filter-panel/list-filter-panel.model';

type StatusFilter = 'All' | OrderStatus;
type PaymentStatusFilter = 'All' | PaymentStatus;

@Component({
  selector: 'app-orders',
  imports: [RouterLink, CommonModule, Pagination, ListFilterPanel],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  orders: OrderSummary[] = [];
  searchTerm = '';
  statusFilter: StatusFilter = 'All';
  paymentStatusFilter: PaymentStatusFilter = 'All';
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

  readonly defaultOrderFilterValues: FilterValues = {
    search: '',
    customerName: '',
    status: 'All',
    paymentStatus: 'All',
  };

  readonly orderFilterFields: ListFilterField[] = [
    {
      key: 'search',
      type: 'search',
      placeholder: 'Search by order #...',
      ariaLabel: 'Search by order number',
    },
    {
      key: 'customerName',
      type: 'search',
      placeholder: 'Search by full customer name...',
      ariaLabel: 'Search by customer name',
    },
    {
      key: 'status',
      type: 'button-group',
      label: 'Order status',
      groupLabel: 'Filter by order status',
      options: [
        { label: 'All', value: 'All' },
        { label: ORDER_STATUS.pending, value: ORDER_STATUS.pending },
        { label: ORDER_STATUS.completed, value: ORDER_STATUS.completed },
        { label: ORDER_STATUS.cancelled, value: ORDER_STATUS.cancelled },
      ],
    },
    {
      key: 'paymentStatus',
      type: 'button-group',
      label: 'Payment status',
      groupLabel: 'Filter by payment status',
      options: [
        { label: 'All', value: 'All' },
        { label: PAYMENT_STATUS.unpaid, value: PAYMENT_STATUS.unpaid },
        { label: PAYMENT_STATUS.paid, value: PAYMENT_STATUS.paid },
        { label: PAYMENT_STATUS.paymentFailed, value: PAYMENT_STATUS.paymentFailed },
        { label: PAYMENT_STATUS.refunded, value: PAYMENT_STATUS.refunded },
      ],
    },
  ];

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

  get hasActiveFilters(): boolean {
    return (
      !!this.searchTerm.trim() ||
      !!this.customerNameFilter.trim() ||
      this.statusFilter !== 'All' ||
      this.paymentStatusFilter !== 'All'
    );
  }

  onFilterSearch(event: ListFilterSearchEvent): void {
    this.searchTerm = String(event.values['search'] ?? '');
    this.customerNameFilter = String(event.values['customerName'] ?? '');
    this.statusFilter = event.values['status'] as StatusFilter;
    this.paymentStatusFilter = event.values['paymentStatus'] as PaymentStatusFilter;
    this.pageSize = event.pageSize;
    this.pageNumber = 1;
    this.loadOrders();
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

  onPageChange(pageNumber: number): void {
    this.pageNumber = pageNumber;
    this.loadOrders();
  }
}
