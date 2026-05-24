import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from '../models/product.model';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/products`;
  private productsCache$?: Observable<Product[]>;

  getProducts(): Observable<Product[]> {
    if (!this.productsCache$) {
      this.productsCache$ = this.http
        .get<Product[]>(this.apiUrl)
        .pipe(shareReplay(1));
    }
    return this.productsCache$;
  }

  clearCache(): void {
    this.productsCache$ = undefined;
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(productData: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, productData);
  }

  updateProduct(id: number, productData: UpdateProductRequest): Observable<void> {
    return this.http
      .put<void>(`${this.apiUrl}/${id}`, productData)
      .pipe(tap(() => this.clearCache()));
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
