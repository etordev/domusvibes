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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthSession {
  id: string;
  name: string;
  token: string;
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
  score: number | null;
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

export interface HomeChanged {
  homeId: string;
  actorUserId: string;
  actorName: string;
  kind: string;
  message: string;
  alert: string | null;
  score: number;
}

export interface MyStatus {
  mood: string;
  energy: string;
  availability: string;
}

export interface MemberStatus {
  userId: string;
  name: string;
  role: string;
  mood: string | null;
  energy: string | null;
  availability: string | null;
}

export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  type: string;
  completed: boolean;
  comment: string | null;
  occurredOn: string;
  createdAt: string;
}

export interface PulsePoint {
  day: string;
  score: number | null;
}

export interface HomeDashboard {
  homeId: string;
  homeName: string;
  score: number;
  lowMood: boolean;
  alert: string | null;
  moodScore: number;
  energyScore: number;
  completedCount: number;
  missedCount: number;
  positiveNotes: number;
  averageMood: string;
  averageEnergy: string;
  myStatus: MyStatus | null;
  members: MemberStatus[];
  recentActivities: ActivityItem[];
  history: PulsePoint[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Users
  createUser(request: CreateUserRequest): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${this.apiUrl}/users`, request);
  }

  login(request: LoginRequest): Observable<AuthSession> {
    return this.http.post<AuthSession>(`${this.apiUrl}/users/login`, request);
  }

  // Homes
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

  generateInviteCode(request: GenerateInviteCodeRequest): Observable<GenerateInviteCodeResponse> {
    return this.http.post<GenerateInviteCodeResponse>(`${this.apiUrl}/homes/invite/generate`, request);
  }

  updateDailyStatus(request: {
    homeId: string;
    userId: string;
    mood: string;
    energy: string;
    availability: string;
  }): Observable<HomeChanged> {
    return this.http.put<HomeChanged>(`${this.apiUrl}/status/daily`, request);
  }

  logActivity(request: {
    homeId: string;
    userId: string;
    type: string;
    completed: boolean;
    comment: string | null;
    occurredOn: string;
  }): Observable<HomeChanged> {
    return this.http.post<HomeChanged>(`${this.apiUrl}/activities`, request);
  }

  updateActivity(activityId: string, request: {
    activityId: string;
    homeId: string;
    userId: string;
    type: string;
    completed: boolean;
    comment: string | null;
    occurredOn: string;
  }): Observable<HomeChanged> {
    return this.http.put<HomeChanged>(`${this.apiUrl}/activities/${activityId}`, request);
  }

  removeActivity(activityId: string, homeId: string): Observable<HomeChanged> {
    return this.http.delete<HomeChanged>(`${this.apiUrl}/activities/${activityId}?homeId=${homeId}`);
  }

  updateUserName(request: { userId: string; name: string }): Observable<{ name: string }> {
    return this.http.put<{ name: string }>(`${this.apiUrl}/users/name`, request);
  }

  updateHome(request: { homeId: string; executorUserId: string; newName: string }): Observable<{ updated: boolean }> {
    return this.http.put<{ updated: boolean }>(`${this.apiUrl}/homes/update`, request);
  }

  updateMemberRole(request: {
    homeId: string;
    executorUserId: string;
    targetUserId: string;
    role: string;
  }): Observable<{ updated: boolean }> {
    return this.http.put<{ updated: boolean }>(`${this.apiUrl}/homes/role`, request);
  }

  removeMember(request: {
    homeId: string;
    executorUserId: string;
    targetUserId: string;
  }): Observable<{ removed: boolean }> {
    return this.http.delete<{ removed: boolean }>(`${this.apiUrl}/homes/remove`, { body: request });
  }
}
