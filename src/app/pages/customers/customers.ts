import { Component, OnInit, inject, signal , computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { CustomerService } from '../../services/customer.service';
import { Customer, CustomerRequest } from '../../models/customer.model';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';



@Component({
  selector: 'app-customers',
  imports: [CommonModule, RouterLink,FormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly fb = inject(FormBuilder);

  authService = inject(AuthService);

  customers = signal<Customer[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');

  errorMessage = signal('');
  successMessage = signal('');

  editingCustomerId = signal<number | null>(null);

  customerForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
  });

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers.set(customers);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load customers.');
        this.isLoading.set(false);
      },
    });
  }
  deleteCustomer(id: number): void {
    const confirmed = confirm('Are you sure you want to delete this customer?');

    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.customerService.deleteCustomer(id).subscribe({
      next: () => {
        this.successMessage.set('Customer deleted successfully.');
        this.loadCustomers();
      },
      error: (error) => {
        if (error.status === 409) {
          this.errorMessage.set(
            'This customer cannot be deleted because they are linked to existing orders.'
          );
        } else {
          this.errorMessage.set('Failed to delete customer.');
        }
      },
    });
  }
  
  private buildRequest(): CustomerRequest {
    const formValue = this.customerForm.getRawValue();

    return {
      name: formValue.name?.trim() ?? '',
      email: formValue.email?.trim() ?? '',
    };
  }
  onSearchChanged(value: string): void {
  this.searchTerm.set(value);
  }
  filteredCustomers = computed(() => {
  const term = this.searchTerm().trim().toLowerCase();

  if (!term) {
    return this.customers();
  }

  return this.customers().filter(customer =>
    customer.name.toLowerCase().includes(term) ||
    customer.email.toLowerCase().includes(term) ||
    customer.id.toString().includes(term)
  );
});

totalCustomersCount = computed(() => this.customers().length); 
}