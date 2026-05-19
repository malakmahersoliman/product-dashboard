import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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
  customers: Customer[] = [];
  products: Product[] = [];

  isSubmitting = false;
  errorMessage: string | null = null;

  orderForm: FormGroup;

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
    this.loadCustomers();
    this.loadProducts();
  }

  createItemGroup(): FormGroup {
    return this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  addItem(): void {
    this.items.push(this.createItemGroup());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (response) => {
        this.customers = response;
      },
      error: () => {
        this.errorMessage = 'Failed to load customers.';
      },
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (response) => {
        this.products = response;
      },
      error: () => {
        this.errorMessage = 'Failed to load products.';
      },
    });
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
    getEstimatedTotal(): number {
    return this.items.controls.reduce((total, control) => {
      const productId = Number(control.get('productId')?.value);
      const quantity = Number(control.get('quantity')?.value);

      const product = this.products.find(p => p.id === productId);

      if (!product || !quantity) {
        return total;
      }

      return total + product.price * quantity;
    }, 0);
  }
}
