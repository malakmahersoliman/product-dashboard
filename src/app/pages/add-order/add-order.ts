import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';

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
export class AddOrder implements OnInit, OnDestroy {
  customers: Customer[] = [];
  products: Product[] = [];

  isLoading = false;
  isSubmitting = false;
  errorMessage: string | null = null;
  estimatedTotal = 0;

  orderForm: FormGroup;
  private formSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private productService: ProductService,
    private orderService: OrderService,
    private router: Router
  ) {
    this.orderForm = this.fb.group({
      customerId: ['', Validators.required],
      items: this.fb.array([this.createItemGroup()]),
    });
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  ngOnInit(): void {
    this.loadLookupData();
    this.formSub = this.orderForm.valueChanges.subscribe(() => {
      this.recalculateTotal();
    });
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
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
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.recalculateTotal();
    }
  }

  loadLookupData(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.orderForm.disable();

    forkJoin({
      customers: this.customerService.getCustomers(),
      products: this.productService.getProducts(),
    }).subscribe({
      next: ({ customers, products }) => {
        this.customers = customers;
        this.products = products;
        this.isLoading = false;
        this.orderForm.enable();
        this.recalculateTotal();
      },
      error: () => {
        this.errorMessage = 'Failed to load customers and products.';
        this.isLoading = false;
      },
    });
  }

  recalculateTotal(): void {
    const items = this.orderForm.getRawValue().items as {
      productId: string;
      quantity: number;
    }[];

    this.estimatedTotal = items.reduce((total, item) => {
      const product = this.products.find(
        (p) => p.id === Number(item.productId)
      );
      const quantity = Number(item.quantity);

      if (!product || !quantity) {
        return total;
      }

      return total + product.price * quantity;
    }, 0);
  }

  onSubmit(): void {
    this.orderForm.markAllAsTouched();

    if (this.orderForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const formValue = this.orderForm.value;

    const request: CreateOrderRequest = {
      customerId: Number(formValue.customerId),
      items: formValue.items.map(
        (item: { productId: string; quantity: number }) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
        })
      ),
    };

    this.orderService.createOrder(request).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/orders']);
      },
      error: () => {
        this.errorMessage = 'Failed to create order.';
        this.isSubmitting = false;
      },
    });
  }
}
