import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CartService } from '../../services/cart.service';
import { CustomerService } from '../../services/customer.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  cartService = inject(CartService);
  authService = inject(AuthService);

  customers = signal<Customer[]>([]);
  isLoadingCustomers = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  checkoutForm = this.fb.group({
    customerId: ['', Validators.required],
    paymentMethod: ['Cash', Validators.required],
    paymentShouldSucceed: [true, Validators.required],
    paymentFailureReason: [''],
  });

  ngOnInit(): void {
    this.loadCustomers();
  }

  get subtotal(): number {
    return this.cartService.total();
  }

  get canPlaceOrder(): boolean {
    if (
      this.isSubmitting() ||
      this.isLoadingCustomers() ||
      this.cartService.items().length === 0 ||
      this.checkoutForm.invalid
    ) {
      return false;
    }

    return this.cartService.items().every(
      (item) => item.quantity > 0 && item.quantity <= item.stock
    );
  }

  get selectedCustomerName(): string | null {
    const customerId = Number(this.checkoutForm.value.customerId);

    if (!customerId) {
      return null;
    }

    return this.customers().find((c) => c.id === customerId)?.name ?? null;
  }

  get paymentShouldSucceed(): boolean {
    return this.checkoutForm.value.paymentShouldSucceed === true;
  }

  loadCustomers(): void {
    this.isLoadingCustomers.set(true);
    this.errorMessage.set(null);

    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers.set(customers);
        this.isLoadingCustomers.set(false);
      },
      error: (error) => {
        console.error(error);
        this.errorMessage.set('Failed to load customers.');
        this.isLoadingCustomers.set(false);
      },
    });
  }

  onIncreaseInCart(productId: number): void {
    this.cartService.increaseInCart(productId);
  }

  onDecreaseInCart(productId: number): void {
    this.cartService.decrease(productId);
  }

  onRemoveFromCart(productId: number): void {
    this.cartService.remove(productId);
  }

  onClearCart(): void {
    this.cartService.clear();
    this.errorMessage.set(null);
  }

  canIncreaseInCart(item: { quantity: number; stock: number }): boolean {
    return item.quantity < item.stock;
  }

  lineTotal(price: number, quantity: number): number {
    return price * quantity;
  }

  onPlaceOrder(): void {
    this.checkoutForm.markAllAsTouched();

    if (!this.canPlaceOrder) {
      return;
    }

    const formValue = this.checkoutForm.getRawValue();
    const paymentShouldSucceed = formValue.paymentShouldSucceed === true;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.orderService
      .createOrder({
        customerId: Number(formValue.customerId),
        paymentMethod: formValue.paymentMethod ?? 'Cash',
        paymentShouldSucceed,
        paymentFailureReason: paymentShouldSucceed
          ? null
          : formValue.paymentFailureReason?.trim() || 'Payment failed.',
        items: this.cartService.toOrderItems(),
      })
      .subscribe({
        next: () => {
          this.cartService.clear();

          if (this.authService.isSuperAdmin()) {
            this.router.navigate(['/orders']);
            return;
          }

          this.router.navigate(['/orders'], {
            queryParams: { orderPlaced: 'true' },
          });
        },
        error: (error) => {
          this.errorMessage.set(
            error.error?.message || 'Payment failed. Please try again.'
          );

          this.isSubmitting.set(false);
        },
      });
  }
}