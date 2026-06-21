import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  OrderResponse,
  PAYMENT_STATUS,
  OrderItemResponse,
  ORDER_STATUS,
  OrderStatus,
} from '../../models/order.model';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-order-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css',
})
export class OrderDetails implements OnInit {
  authService = inject(AuthService);

  order: OrderResponse | null = null;
  isLoading = false;
  errorMessage = '';
  isUpdating = false;
  ORDER_STATUS = ORDER_STATUS;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadOrder(id);
  }

  loadOrder(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getOrderById(id).subscribe({
      next: (response) => {
        this.order = response;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to load order. Please try again later.';
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

  canComplete(): boolean {
    return this.order?.status === ORDER_STATUS.pending;
  }

  canCancel(): boolean {
    return this.order?.status === ORDER_STATUS.pending;
  }

  itemCount(): number {
    return this.order?.items.length ?? 0;
  }

  orderTotal(): number {
    return this.order?.totalAmount ?? 0;
  }

  lineTotal(item: OrderItemResponse): number {
    return item.subtotal;
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

  onUpdateStatus(status: OrderStatus): void {
    if (!this.order || !this.canComplete()) {
      return;
    }

    this.isUpdating = true;
    this.errorMessage = '';

    this.orderService.updateOrderStatus(this.order.id, status).subscribe({
      next: () => {
        this.order!.status = status;
        this.isUpdating = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to update order status.';
        this.isUpdating = false;
        this.cdr.markForCheck();
      },
    });
  }

  onDeleteOrder(): void {
    if (!this.order) {
      return;
    }

    const confirmed = confirm('Are you sure you want to delete this order?');

    if (!confirmed) {
      return;
    }

    this.orderService.deleteOrder(this.order.id).subscribe({
      next: () => {
        this.router.navigate(['/orders']);
      },
      error: () => {
        this.errorMessage = 'Failed to delete order.';
        this.cdr.markForCheck();
      },
    });
  }
getPaymentStatusLabel(paymentStatus: string | null | undefined): string {
  return paymentStatus || PAYMENT_STATUS.unpaid;
}

getPaymentStatusClass(paymentStatus: string | null | undefined): string {
  const status = paymentStatus || PAYMENT_STATUS.unpaid;

  switch (status) {
    case PAYMENT_STATUS.paid:
      return 'payment-badge--paid';

    case PAYMENT_STATUS.refunded:
      return 'payment-badge--refunded';

    case PAYMENT_STATUS.paymentFailed:
      return 'payment-badge--failed';

    default:
      return 'payment-badge--unpaid';
  }
}
}
