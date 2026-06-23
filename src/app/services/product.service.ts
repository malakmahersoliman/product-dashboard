import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductFilterParams,
} from '../models/product.model';
import { PagedResult } from '../models/common.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/products`;
  private readonly serverUrl = environment.serverUrl;

  getProducts(filters: ProductFilterParams): Observable<PagedResult<Product>> {
    let params = new HttpParams()
      .set('pageNumber', filters.pageNumber)
      .set('pageSize', filters.pageSize);

    if (filters.search?.trim()) {
      params = params.set('search', filters.search.trim());
    }

    if (filters.categoryId !== null && filters.categoryId !== undefined) {
      params = params.set('categoryId', filters.categoryId);
    }

    if (filters.isAvailable !== null && filters.isAvailable !== undefined) {
      params = params.set('isAvailable', filters.isAvailable);
    }

    if (filters.stockStatus) {
      params = params.set('stockStatus', filters.stockStatus);
    }

    if (filters.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }

    if (filters.sortDirection) {
      params = params.set('sortDirection', filters.sortDirection);
    }

    return this.http.get<PagedResult<Product>>(this.apiUrl, { params });
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(productData: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, productData);
  }

  updateProduct(id: number, productData: UpdateProductRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, productData);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getImageUrl(imagePath?: string | null): string {
    if (!imagePath) {
      return 'assets/images/product-placeholder.png';
    }

    return `${this.serverUrl}${imagePath}`;
  }
}