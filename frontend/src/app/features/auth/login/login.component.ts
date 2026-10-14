import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LanguageSelectComponent } from '../../../shared/components/language-select/language-select.component';
import { CreateUserRequest, LoginRequest } from '../models/auth.model';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../../../core/session.service';

/** Password: min 6 chars, at least one upper, one lower, one digit, one special character */
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;

function strongPasswordValidator(control: AbstractControl): { strongPassword: true } | null {
  if (!control.value) return null;
  return STRONG_PASSWORD.test(control.value) ? null : { strongPassword: true };
}

/** Build a single error message from API error body (supports error, errors.*, message, title) */
function getApiErrorMessage(err: { error?: { error?: string; message?: string; title?: string; errors?: Record<string, string[]> } }, fallback: string, validation: string): string {
  const body = err?.error;
  if (!body) return fallback;
  if (typeof body === 'string') return body;
  if (body.error) return body.error;
  if (body.message) return body.message;
  if (body.title) return body.title;
  if (body.errors && typeof body.errors === 'object') {
    const lines = Object.values(body.errors).flat().filter(Boolean);
    return lines.length ? lines.join(' ') : validation;
  }
  return fallback;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, TranslateModule, LanguageSelectComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private readonly translate = inject(TranslateService);
  loginForm: FormGroup;
  registerForm: FormGroup;
  readonly isLoginMode = signal(true);
  readonly errorMessage = signal('');
  readonly isLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private session: SessionService
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
    this.isLoginMode.update(mode => !mode);
    this.errorMessage.set('');
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      const formValue = this.loginForm.value;
      const loginData: LoginRequest = {
        email: formValue.email,
        password: formValue.password
      };

      this.auth.login(loginData).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.session.save({
            token: response.token,
            id: response.id,
            name: response.name,
            email: formValue.email
          });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error, this.translate.instant('Login.GenericError'), this.translate.instant('Login.ValidationFailed')));
          this.isLoading.set(false);
        }
      });
    }
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const formValue = this.registerForm.value;
      const userData: CreateUserRequest = {
        email: formValue.email,
        name: formValue.name,
        password: formValue.password
      };

      this.auth.createUser(userData).subscribe({
        next: (response) => {
          this.session.save({
            token: response.token,
            id: response.id,
            name: response.name,
            email: formValue.email
          });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage.set(getApiErrorMessage(error, this.translate.instant('Login.GenericError'), this.translate.instant('Login.ValidationFailed')));
          this.isLoading.set(false);
        }
      });
    }
  }
}
