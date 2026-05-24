import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
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
  private fb = inject(FormBuilder);
  cartService = inject(CartService);
  authService = inject(AuthService);
  private customerService = inject(CustomerService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  customers: Customer[] = [];
  isLoadingCustomers = false;
  isSubmitting = false;
  errorMessage: string | null = null;

  checkoutForm = this.fb.group({
    customerId: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoadingCustomers = true;

    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.isLoadingCustomers = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load customers.';
        this.isLoadingCustomers = false;
      },
    });
  }

  onIncreaseInCart(productId: number): void {
    this.cartService.increaseInCart(productId);
    this.cdr.markForCheck();
  }

  onDecreaseInCart(productId: number): void {
    this.cartService.decrease(productId);
    this.cdr.markForCheck();
  }

  onRemoveFromCart(productId: number): void {
    this.cartService.remove(productId);
    this.cdr.markForCheck();
  }

  onPlaceOrder(): void {
    this.checkoutForm.markAllAsTouched();

    if (this.checkoutForm.invalid || this.cartService.items().length === 0) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    this.orderService
      .createOrder({
        customerId: Number(this.checkoutForm.value.customerId),
        items: this.cartService.toOrderItems(),
      })
      .subscribe({
        next: () => {
          this.cartService.clear();

          if (this.authService.isSuperAdmin()) {
            this.router.navigate(['/orders']);
            return;
          }

          this.router.navigate(['/products'], {
            queryParams: { orderPlaced: 'true' },
          });
        },
        error: () => {
          this.errorMessage = 'Failed to create order. Please try again.';
          this.isSubmitting = false;
        },
      });
  }
}
