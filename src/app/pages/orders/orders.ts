import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ORDER_STATUS, OrderResponse, OrderStatus } from '../../models/order.model';
import { OrderService } from '../../services/order.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-orders',
  imports: [RouterLink, CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  orders: OrderResponse[] = [];
  isLoading = false;
  ORDER_STATUS = ORDER_STATUS;
  errorMessage: string | null = null;
  updatingOrderId: number | null = null;

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
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

  isCompleted(order: OrderResponse): boolean {
    return order.status === ORDER_STATUS.completed;
  }

  onUpdateStatus(id: number, status: OrderStatus): void {
    this.updatingOrderId = id;
    this.errorMessage = null;

    this.orderService.updateOrderStatus(id, status).subscribe({
      next: () => {
        const order = this.orders.find((o) => o.id === id);
        if (order) {
          order.status = ORDER_STATUS.completed;
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
