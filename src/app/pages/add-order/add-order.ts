import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Customer } from '../../models/customer.model';
import { Product } from '../../models/product.model';
import { CreateOrderRequest } from '../../models/order.model';

import { CustomerService } from '../../services/customer.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-add-order',
  imports: [ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './add-order.html',
  styleUrl: './add-order.css',
})
export class AddOrder implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  customers = signal<Customer[]>([]);
  products = signal<Product[]>([]);

  isLoading = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  estimatedTotal = signal(0);

  orderForm = this.fb.group({
    customerId: ['', Validators.required],
    paymentMethod: ['Cash', Validators.required],
    paymentShouldSucceed: [true, Validators.required],
    paymentFailureReason: [''],
    items: this.fb.array([this.createItemGroup()]),
  });

  constructor() {
    this.orderForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.recalculateTotal();
      });
  }

  ngOnInit(): void {
    this.loadLookupData();
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  get paymentShouldSucceed(): boolean {
    return this.orderForm.value.paymentShouldSucceed === true;
  }

  createItemGroup(): FormGroup {
    return this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  addItem(): void {
    this.items.push(this.createItemGroup());
    this.recalculateTotal();
  }

  removeItem(index: number): void {
    if (this.items.length <= 1) {
      return;
    }

    this.items.removeAt(index);
    this.recalculateTotal();
  }

  loadLookupData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.orderForm.disable();

    forkJoin({
      customers: this.customerService.getCustomers(),
      products: this.productService.getProducts({
        pageNumber: 1,
        pageSize: 500,
        sortBy: 'name',
        sortDirection: 'asc',
      }),
    }).subscribe({
      next: ({ customers, products }) => {
        this.customers.set(customers);
        this.products.set(products.items);

        this.isLoading.set(false);
        this.orderForm.enable();

        this.recalculateTotal();
      },
      error: (error) => {
        console.error(error);

        this.errorMessage.set('Failed to load customers and products.');
        this.isLoading.set(false);
        this.orderForm.enable();
      },
    });
  }

  recalculateTotal(): void {
    const items = this.orderForm.getRawValue().items as {
      productId: string;
      quantity: number;
    }[];

    const total = items.reduce((sum, item) => {
      const product = this.products().find(
        (p) => p.id === Number(item.productId)
      );

      const quantity = Number(item.quantity);

      if (!product || !quantity) {
        return sum;
      }

      return sum + product.price * quantity;
    }, 0);

    this.estimatedTotal.set(total);
  }

  onSubmit(): void {
    this.orderForm.markAllAsTouched();

    if (this.orderForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formValue = this.orderForm.getRawValue();
    const paymentShouldSucceed = formValue.paymentShouldSucceed === true;

    const request: CreateOrderRequest = {
      customerId: Number(formValue.customerId),
      paymentMethod: formValue.paymentMethod ?? 'Cash',
      paymentShouldSucceed,
      paymentFailureReason: paymentShouldSucceed
        ? null
        : formValue.paymentFailureReason?.trim() || 'Payment failed.',
        items: formValue.items.map(
          (item: any) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
          })
        ),
    };

    this.orderService.createOrder(request).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/orders']);
      },
      error: (error) => {
        this.errorMessage.set(
          error.error?.message || 'Failed to create order.'
        );

        this.isSubmitting.set(false);
      },
    });
  }
}