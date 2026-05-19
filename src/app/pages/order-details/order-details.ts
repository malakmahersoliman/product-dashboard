import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderResponse, ORDER_STATUS } from '../../models/order.model';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-details',
  imports: [CommonModule, RouterLink],
  templateUrl: './order-details.html',
  styleUrl: './order-details.css',
})
export class OrderDetails implements OnInit {
  order: OrderResponse | null = null;
  isLoading = false;
  errorMessage = '';
  isUpdating = false;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
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

  isCompleted(): boolean {
    return this.order?.status === ORDER_STATUS.completed;
  }

  onUpdateStatus(): void {
    if (!this.order || this.isCompleted()) {
      return;
    }

    this.isUpdating = true;
    this.errorMessage = '';

    this.orderService.updateOrderStatus(this.order.id, ORDER_STATUS.completed).subscribe({
      next: () => {
        this.order!.status = ORDER_STATUS.completed;
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
}
