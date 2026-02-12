import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService, CreateUserRequest, LoginRequest } from '../../services/api.service';

/** Password: min 6 chars, at least one upper, one lower, one digit, one special character */
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;

function strongPasswordValidator(control: AbstractControl): { strongPassword: true } | null {
  if (!control.value) return null;
  return STRONG_PASSWORD.test(control.value) ? null : { strongPassword: true };
}

/** Build a single error message from API error body (supports error, errors.*, message, title) */
function getApiErrorMessage(err: { error?: { error?: string; message?: string; title?: string; errors?: Record<string, string[]> } }): string {
  const body = err?.error;
  if (!body) return 'Something went wrong. Please try again.';
  if (typeof body === 'string') return body;
  if (body.error) return body.error;
  if (body.message) return body.message;
  if (body.title) return body.title;
  if (body.errors && typeof body.errors === 'object') {
    const lines = Object.values(body.errors).flat().filter(Boolean);
    return lines.length ? lines.join(' ') : 'Validation failed. Please check your input.';
  }
  return 'Something went wrong. Please try again.';
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoginMode = true;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), strongPasswordValidator]]
    });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const formValue = this.loginForm.value;
      const loginData: LoginRequest = {
        email: formValue.email,
        password: formValue.password
      };

      this.apiService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading = false;
          localStorage.setItem('userId', response.id);
          localStorage.setItem('userEmail', formValue.email);
          localStorage.setItem('userName', response.name);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage = getApiErrorMessage(error);
          this.isLoading = false;
        }
      });
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const formValue = this.registerForm.value;
      const userData: CreateUserRequest = {
        email: formValue.email,
        name: formValue.name,
        password: formValue.password
      };

      this.apiService.createUser(userData).subscribe({
        next: (response) => {
          // Store user ID in localStorage
          localStorage.setItem('userId', response.id);
          localStorage.setItem('userEmail', formValue.email);
          localStorage.setItem('userName', formValue.name);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage = getApiErrorMessage(error);
          this.isLoading = false;
        }
      });
    }
  }
}
