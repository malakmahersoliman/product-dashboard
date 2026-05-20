import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LoginRequest, LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly emailKey = 'auth_email';

  login(request: LoginRequest): Observable<LoginResponse> {
    if (request.email === 'admin@test.com' && request.password === '123456') {
      return of({
        token: 'mock-jwt-token',
        email: request.email,
        role: 'Admin'
      }).pipe(delay(500));
    }

    return throwError(() => new Error('Invalid email or password'));
  }

  saveSession(response: LoginResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.emailKey, response.email);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.emailKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getEmail(): string | null {
    return localStorage.getItem(this.emailKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}