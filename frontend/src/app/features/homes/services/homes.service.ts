import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateHomeRequest,
  CreateHomeResponse,
  HomeDetails,
  HomeListItem,
  JoinHomeByInviteRequest,
  JoinHomeByInviteResponse,
  JoinHomeRequest,
  JoinHomeResponse
} from '../models/homes.model';

@Injectable({ providedIn: 'root' })
export class HomesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  createHome(request: CreateHomeRequest): Observable<CreateHomeResponse> {
    return this.http.post<CreateHomeResponse>(`${this.apiUrl}/homes`, request);
  }

  getHomesByUserId(): Observable<HomeListItem[]> {
    return this.http.get<HomeListItem[]>(`${this.apiUrl}/homes/mine`);
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
}
