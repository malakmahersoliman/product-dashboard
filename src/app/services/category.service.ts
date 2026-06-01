import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { Category, CategoryRequest } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/categories`;

  private categoriesCache$?: Observable<Category[]>;

  getCategories(): Observable<Category[]> {
    if (!this.categoriesCache$) {
      this.categoriesCache$ = this.http
        .get<Category[]>(this.apiUrl)
        .pipe(shareReplay(1));
    }

    return this.categoriesCache$;
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  createCategory(request: CategoryRequest): Observable<Category> {
    return this.http
      .post<Category>(this.apiUrl, request)
      .pipe(tap(() => this.clearCache()));
  }

  updateCategory(id: number, request: CategoryRequest): Observable<Category> {
    return this.http
      .put<Category>(`${this.apiUrl}/${id}`, request)
      .pipe(tap(() => this.clearCache()));
  }

  deleteCategory(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.clearCache()));
  }

  clearCache(): void {
    this.categoriesCache$ = undefined;
  }
}