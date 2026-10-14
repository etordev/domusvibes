import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthSession, CreateUserRequest, LoginRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  createUser(request: CreateUserRequest): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${this.apiUrl}/users`, request);
  }

  login(request: LoginRequest): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${this.apiUrl}/users/login`, request);
  }
}
