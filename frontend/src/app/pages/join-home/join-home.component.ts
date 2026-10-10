import { afterNextRender, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LanguageSelectComponent } from '../../components/language-select/language-select.component';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-join-home',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, TranslateModule, LanguageSelectComponent],
  templateUrl: './join-home.component.html',
  styleUrls: ['./join-home.component.scss']
})
export class JoinHomeComponent {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly session = inject(SessionService);
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
      const storedUserId = this.session.userId();
      if (!this.session.token() || !storedUserId) {
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
          this.successMessage.set(this.translate.instant('Join.Success'));
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message || this.translate.instant('Join.Failed'));
          this.isLoading.set(false);
        }
      });
    }
  }
}
