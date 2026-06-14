import { HttpClient , HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  OrderFilterRequest,
  CreateOrderRequest,
  OrderResponse,
  OrderSummary,
} from '../models/order.model';
import { environment } from '../../environments/environment';
import { PagedResult } from '../models/common.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  getOrders(filter: OrderFilterRequest): Observable<PagedResult<OrderSummary>> {
    let params = new HttpParams()
      .set('pageNumber', filter.pageNumber)
      .set('pageSize', filter.pageSize)
      .set('sortBy', filter.sortBy ?? 'orderDate')
      .set('sortDirection', filter.sortDirection ?? 'desc');

    if (filter.search) params = params.set('search', filter.search);
    if (filter.customerId) params = params.set('customerId', filter.customerId);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.paymentStatus) params = params.set('paymentStatus', filter.paymentStatus);

    return this.http.get<PagedResult<OrderSummary>>(this.apiUrl, { params });
  }

  getOrderById(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.apiUrl}/${id}`);
  }

  createOrder(orderData: CreateOrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.apiUrl, orderData);
  }

  updateOrderStatus(id: number, status: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
