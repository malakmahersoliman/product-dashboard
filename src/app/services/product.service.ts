import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest
} from '../models/product.model';
import { Observable } from 'rxjs';






@Injectable({
  providedIn: 'root',
})



export class ProductService {
    private http = inject(HttpClient);
    private readonly apiUrl = 'http://localhost:5023/api/products';
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
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
}
