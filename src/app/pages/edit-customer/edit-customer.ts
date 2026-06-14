import { Component, ChangeDetectorRef, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { CustomerService } from '../../services/customer.service';
import { CustomerRequest } from '../../models/customer.model';

@Component({
  selector: 'app-edit-customer',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './edit-customer.html',
  styleUrl: './edit-customer.css',
})
export class EditCustomer implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  customerId!: number;

  isLoading = signal(false);
  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  customerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.customerId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCustomer();
  }

  loadCustomer(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.cdr.markForCheck();

    this.customerService.getCustomerById(this.customerId).subscribe({
      next: customer => {
        this.customerForm.patchValue({
          name: customer.name,
          email: customer.email,
        });

        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage.set('Failed to load customer. Please try again.');
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  onSubmit(): void {
    this.customerForm.markAllAsTouched();

    if (this.customerForm.invalid) {
      return;
    }

    const request = this.buildRequest();

    this.isSubmitting.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);
    this.cdr.markForCheck();

    this.customerService.updateCustomer(this.customerId, request).subscribe({
      next: () => {
        this.successMessage.set('Customer updated successfully.');
        this.customerService.clearCache();
        this.router.navigate(['/customers']);
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage.set('Failed to update customer. Please try again.');
        this.isSubmitting.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  private buildRequest(): CustomerRequest {
    const value = this.customerForm.getRawValue();

    return {
      name: value.name?.trim() ?? '',
      email: value.email?.trim() ?? '',
    };
  }
}