import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService, HomeDetails } from '../../services/api.service';

@Component({
  selector: 'app-home-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-details.component.html',
  styleUrls: ['./home-details.component.scss']
})
export class HomeDetailsComponent implements OnInit {
  homeId = '';
  home: HomeDetails | null = null;
  isLoading = false;
  errorMessage = '';
  userId = '';
  inviteCode = '';
  isGeneratingInvite = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      this.router.navigate(['/login']);
      return;
    }
    this.userId = storedUserId;

    this.route.params.subscribe(params => {
      this.homeId = params['id'];
      if (this.homeId) {
        this.loadHomeDetails();
      }
    });
  }

  loadHomeDetails() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getHomeDetails(this.homeId).subscribe({
      next: (home) => {
        this.home = home;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load home details.';
        this.isLoading = false;
      }
    });
  }

  generateInviteCode() {
    this.isGeneratingInvite = true;
    this.apiService.generateInviteCode({
      homeId: this.homeId,
      executorUserId: this.userId
    }).subscribe({
      next: (response) => {
        this.inviteCode = response.inviteCode;
        this.isGeneratingInvite = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to generate invite code.';
        this.isGeneratingInvite = false;
      }
    });
  }

  copyInviteCode() {
    if (this.inviteCode) {
      navigator.clipboard.writeText(this.inviteCode).then(() => {
        alert('Invite code copied to clipboard!');
      });
    }
  }
}
