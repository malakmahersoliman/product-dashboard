import { HttpClient } from '@angular/common/http';
import {  inject,Injectable } from '@angular/core';
import { Customer , CreateCustomerRequest} from '../models/customer.model';
import { Observable } from 'rxjs';

@Injectable()
export class CustomerService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5023/api/customers';
  
  getCustomers(): Observable<Customer[]> {
   return this.http.get<Customer[]>(this.apiUrl);
  }
createCustomer(customerData: CreateCustomerRequest): Observable<Customer>{
  return this.http.post<Customer>(this.apiUrl, customerData);
}
}
