import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-create-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-home.component.html',
  styleUrls: ['./create-home.component.scss']
})
export class CreateHomeComponent implements OnInit {
  createHomeForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  userId = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.createHomeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
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
    if (this.createHomeForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formValue = this.createHomeForm.value;
      this.apiService.createHome({
        name: formValue.name,
        ownerUserId: this.userId
      }).subscribe({
        next: (response) => {
          this.successMessage = 'Home created successfully!';
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to create home. Please try again.';
          this.isLoading = false;
        }
      });
    }
  }
}
