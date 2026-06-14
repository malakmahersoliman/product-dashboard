import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { Customer, CustomerRequest } from '../models/customer.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/customers`;

  private customersCache$?: Observable<Customer[]>;

  getCustomers(): Observable<Customer[]> {
    if (!this.customersCache$) {
      this.customersCache$ = this.http
        .get<Customer[]>(this.apiUrl)
        .pipe(shareReplay(1));
    }

    return this.customersCache$;
  }

  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  createCustomer(customerData: CustomerRequest): Observable<Customer> {
    return this.http
      .post<Customer>(this.apiUrl, customerData)
      .pipe(tap(() => this.clearCache()));
  }

  updateCustomer(id: number, customerData: CustomerRequest): Observable<void> {
    return this.http
      .put<void>(`${this.apiUrl}/${id}`, customerData)
      .pipe(tap(() => this.clearCache()));
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.clearCache()));
  }

  clearCache(): void {
    this.customersCache$ = undefined;
  }
}