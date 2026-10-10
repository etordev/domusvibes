import { afterNextRender, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-join-home',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './join-home.component.html',
  styleUrls: ['./join-home.component.scss']
})
export class JoinHomeComponent {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly userId = signal('');

  readonly joinHomeForm: FormGroup;
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  constructor() {
    const fb = inject(FormBuilder);
    this.joinHomeForm = fb.group({
      inviteCode: ['', [Validators.required, Validators.minLength(4)]]
    });

    afterNextRender(() => {
      const storedUserId = localStorage.getItem('userId');
      if (!storedUserId) {
        this.router.navigate(['/login']);
        return;
      }
      this.userId.set(storedUserId);
    });
  }

  onSubmit() {
    if (this.joinHomeForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const formValue = this.joinHomeForm.value;
      this.apiService.joinHomeByInvite({
        userId: this.userId(),
        inviteCode: formValue.inviteCode
      }).subscribe({
        next: () => {
          this.successMessage.set('Successfully joined the home!');
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message || 'Failed to join home. Please check the invite code and try again.');
          this.isLoading.set(false);
        }
      });
    }
  }
}
