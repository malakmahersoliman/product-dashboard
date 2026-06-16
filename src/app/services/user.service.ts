import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateUserRequest,User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = 'https://localhost:YOUR_PORT/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, request);
  }
}