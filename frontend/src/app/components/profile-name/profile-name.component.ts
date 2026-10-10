import { afterNextRender, Component, inject, output, signal } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { EditNameDialogComponent } from './edit-name-dialog.component';

@Component({
  selector: 'app-profile-name',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './profile-name.component.html',
  styleUrl: './profile-name.component.scss'
})
export class ProfileNameComponent {
  private dialog = inject(Dialog);
  private translate = inject(TranslateService);
  readonly name = signal('User');
  readonly saved = output<string>();

  constructor() {
    afterNextRender(() => {
      this.name.set(localStorage.getItem('userName') || 'User');
    });
  }

  edit() {
    this.dialog.open<string>(EditNameDialogComponent, {
      data: this.name(),
      role: 'dialog',
      ariaLabel: this.translate.instant('Profile.EditAria'),
      backdropClass: 'dv-dialog-backdrop',
      panelClass: 'dv-dialog-pane',
      autoFocus: 'first-tabbable',
      width: '420px',
      maxWidth: 'calc(100vw - 2rem)'
    }).closed.subscribe(name => {
      if (!name) return;
      this.name.set(name);
      this.saved.emit(name);
    });
  }
}
