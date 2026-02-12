import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Models
export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

export interface CreateUserResponse {
  id: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  name: string;
}

export interface CreateHomeRequest {
  name: string;
  ownerUserId: string;
}

export interface CreateHomeResponse {
  homeId: string;
}

export interface HomeListItem {
  id: string;
  name: string;
  role: string;
}

export interface HomeMember {
  userId: string;
  name: string;
  role: string;
}

export interface HomeDetails {
  id: string;
  name: string;
  members: HomeMember[];
}

export interface JoinHomeRequest {
  userId: string;
  homeId: string;
}

export interface JoinHomeResponse {
  joined: boolean;
}

export interface JoinHomeByInviteRequest {
  userId: string;
  inviteCode: string;
}

export interface JoinHomeByInviteResponse {
  joined: boolean;
}

export interface GenerateInviteCodeRequest {
  homeId: string;
  executorUserId: string;
}

export interface GenerateInviteCodeResponse {
  inviteCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Users
  createUser(request: CreateUserRequest): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(`${this.apiUrl}/users`, request);
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/users/login`, request);
  }

  // Homes
  createHome(request: CreateHomeRequest): Observable<CreateHomeResponse> {
    return this.http.post<CreateHomeResponse>(`${this.apiUrl}/homes`, request);
  }

  getHomesByUserId(userId: string): Observable<HomeListItem[]> {
    return this.http.get<HomeListItem[]>(`${this.apiUrl}/homes/user/${userId}`);
  }

  getHomeDetails(homeId: string): Observable<HomeDetails> {
    return this.http.get<HomeDetails>(`${this.apiUrl}/homes/${homeId}`);
  }

  joinHome(request: JoinHomeRequest): Observable<JoinHomeResponse> {
    return this.http.post<JoinHomeResponse>(`${this.apiUrl}/homes/join`, request);
  }

  joinHomeByInvite(request: JoinHomeByInviteRequest): Observable<JoinHomeByInviteResponse> {
    return this.http.post<JoinHomeByInviteResponse>(`${this.apiUrl}/homes/invite/join`, request);
  }

  generateInviteCode(request: GenerateInviteCodeRequest): Observable<GenerateInviteCodeResponse> {
    return this.http.post<GenerateInviteCodeResponse>(`${this.apiUrl}/homes/invite/generate`, request);
  }
}
