import { Component, OnInit, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { ListFilterPanel } from '../../components/list-filter-panel/list-filter-panel';
import {
  FilterValues,
  ListFilterField,
  ListFilterSearchEvent,
} from '../../components/list-filter-panel/list-filter-panel.model';



@Component({
  selector: 'app-customers',
  imports: [CommonModule, RouterLink, ListFilterPanel],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {
  @ViewChild(ListFilterPanel) filterPanel?: ListFilterPanel;

  private readonly customerService = inject(CustomerService);
  authService = inject(AuthService);

  customers = signal<Customer[]>([]);
  isLoading = signal(false);
  appliedSearchTerm = signal('');

  errorMessage = signal('');
  successMessage = signal('');

  readonly defaultCustomerFilterValues: FilterValues = {
    search: '',
  };

  readonly customerFilterFields: ListFilterField[] = [
    {
      key: 'search',
      type: 'search',
      label: 'Search',
      chipLabel: 'Search',
      placeholder: 'Customer #, name, or email...',
      ariaLabel: 'Search customers',
    },
  ];

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
  
  onFilterSearch(event: ListFilterSearchEvent): void {
    this.appliedSearchTerm.set(String(event.values['search'] ?? '').trim());
  }

  clearFilters(): void {
    this.filterPanel?.onReset();
  }

  filteredCustomers = computed(() => {
    const term = this.appliedSearchTerm().toLowerCase();

    if (!term) {
      return this.customers();
    }

    return this.customers().filter(
      (customer) =>
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        customer.id.toString().includes(term)
    );
  });

  totalCustomersCount = computed(() => this.customers().length);
}