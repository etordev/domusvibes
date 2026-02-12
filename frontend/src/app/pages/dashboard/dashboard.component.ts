import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService, HomeListItem } from '../../services/api.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  homes: HomeListItem[] = [];
  isLoading = false;
  errorMessage = '';
  userName = '';
  userId = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');

    if (!storedUserId) {
      this.router.navigate(['/login']);
      return;
    }

    this.userId = storedUserId;
    this.userName = storedUserName || 'User';
    this.loadHomes();
  }

  /** Normalize API response to always have id, name, role (camelCase) */
  private normalizeHomes(raw: unknown): HomeListItem[] {
    if (!Array.isArray(raw)) return [];
    return raw.map((item: Record<string, unknown>) => ({
      id: String(item['id'] ?? item['Id'] ?? ''),
      name: String(item['name'] ?? item['Name'] ?? ''),
      role: String(item['role'] ?? item['Role'] ?? '')
    }));
  }

  loadHomes() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getHomesByUserId(this.userId).pipe(
      finalize(() => (this.isLoading = false))
    ).subscribe({
      next: (raw) => {
        this.homes = this.normalizeHomes(raw);
      },
      error: (error) => {
        this.errorMessage = error?.error?.error ?? error?.error?.message ?? 'Failed to load homes. Please try again.';
      }
    });
  }

  viewHomeDetails(homeId: string) {
    this.router.navigate(['/home', homeId]);
  }

  logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    this.router.navigate(['/']);
  }
}
