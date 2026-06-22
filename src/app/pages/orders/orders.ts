import { Component, OnInit, ChangeDetectorRef, ViewChild, inject } from '@angular/core';
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
import { AuthService } from '../../services/auth.service';
import { RouterLink, Router } from '@angular/router';
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
  authService = inject(AuthService);

  @ViewChild(ListFilterPanel) filterPanel?: ListFilterPanel;

  orders: OrderSummary[] = [];
  searchTerm = '';
  statusFilter: StatusFilter = 'All';
  paymentStatusFilter: PaymentStatusFilter = 'All';
  customerNameFilter = '';

  pageNumber = 1;
  pageSize = 20;
  totalCount = 0;
  totalPages = 0;

  isLoading = false;
  ORDER_STATUS = ORDER_STATUS;
  PAYMENT_STATUS = PAYMENT_STATUS;
  errorMessage: string | null = null;
  updatingOrderId: number | null = null;

  readonly pageSizeOptions = [10, 20, 50];

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
      label: 'Order #',
      chipLabel: 'Order #',
      placeholder: 'e.g. 1042',
      ariaLabel: 'Search by order number',
    },
    {
      key: 'customerName',
      type: 'search',
      label: 'Customer',
      chipLabel: 'Customer',
      placeholder: 'Full name',
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
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  get hasActiveFilters(): boolean {
    return (
      !!this.searchTerm.trim() ||
      !!this.customerNameFilter.trim() ||
      this.statusFilter !== 'All' ||
      this.paymentStatusFilter !== 'All'
    );
  }

  get rangeStart(): number {
    if (this.totalCount === 0) {
      return 0;
    }

    return (this.pageNumber - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    if (this.totalCount === 0) {
      return 0;
    }

    return Math.min(this.pageNumber * this.pageSize, this.totalCount);
  }

  onFilterSearch(event: ListFilterSearchEvent): void {
    this.searchTerm = String(event.values['search'] ?? '');
    this.customerNameFilter = String(event.values['customerName'] ?? '');
    this.statusFilter = event.values['status'] as StatusFilter;
    this.paymentStatusFilter = event.values['paymentStatus'] as PaymentStatusFilter;
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
    const status = paymentStatus || PAYMENT_STATUS.unpaid;

    switch (status) {
      case PAYMENT_STATUS.paid:
        return 'payment-badge payment-badge--paid';

      case PAYMENT_STATUS.refunded:
        return 'payment-badge payment-badge--refunded';

      case PAYMENT_STATUS.paymentFailed:
        return 'payment-badge payment-badge--failed';

      default:
        return 'payment-badge payment-badge--unpaid';
    }
  }

  getPaymentStatusLabel(paymentStatus: string | null | undefined): string {
    return paymentStatus || PAYMENT_STATUS.unpaid;
  }

  onPageChange(pageNumber: number): void {
    this.pageNumber = pageNumber;
    this.loadOrders();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageNumber = 1;
    this.loadOrders();
  }

  clearFilters(): void {
    this.filterPanel?.onReset();
  }

  openOrder(orderId: number): void {
    this.router.navigate(['/orders', orderId]);
  }
}
