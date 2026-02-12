import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-join-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './join-home.component.html',
  styleUrls: ['./join-home.component.scss']
})
export class JoinHomeComponent implements OnInit {
  joinHomeForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  userId = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.joinHomeForm = this.fb.group({
      inviteCode: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  ngOnInit() {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      this.router.navigate(['/login']);
      return;
    }
    this.userId = storedUserId;
  }

  onSubmit() {
    if (this.joinHomeForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formValue = this.joinHomeForm.value;
      this.apiService.joinHomeByInvite({
        userId: this.userId,
        inviteCode: formValue.inviteCode
      }).subscribe({
        next: (response) => {
          this.successMessage = 'Successfully joined the home!';
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to join home. Please check the invite code and try again.';
          this.isLoading = false;
        }
      });
    }
  }
}
