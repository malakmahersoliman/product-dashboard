import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Customer, CreateCustomerRequest } from '../models/customer.model';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient);
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

  clearCache(): void {
    this.customersCache$ = undefined;
  }

  createCustomer(customerData: CreateCustomerRequest): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customerData);
  }
}
