import { afterNextRender, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LanguageSelectComponent } from '../../components/language-select/language-select.component';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-create-home',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, TranslateModule, LanguageSelectComponent],
  templateUrl: './create-home.component.html',
  styleUrls: ['./create-home.component.scss']
})
export class CreateHomeComponent {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly session = inject(SessionService);
  private readonly userId = signal('');

  readonly createHomeForm: FormGroup;
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  constructor() {
    const fb = inject(FormBuilder);
    this.createHomeForm = fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
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
    if (this.createHomeForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const formValue = this.createHomeForm.value;
      this.apiService.createHome({
        name: formValue.name,
        ownerUserId: this.userId()
      }).subscribe({
        next: () => {
          this.successMessage.set(this.translate.instant('Create.Success'));
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message || this.translate.instant('Create.Failed'));
          this.isLoading.set(false);
        }
      });
    }
  }
}
