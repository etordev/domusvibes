import { Component, inject, signal } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-edit-name-dialog',
  standalone: true,
  templateUrl: './edit-name-dialog.component.html',
  styleUrl: './edit-name-dialog.component.scss'
})
export class EditNameDialogComponent {
  private dialogRef = inject(DialogRef<string>);
  private api = inject(ApiService);
  readonly name = signal(inject<string>(DIALOG_DATA));
  readonly saving = signal(false);
  readonly error = signal('');

  setName(event: Event) {
    this.name.set((event.target as HTMLInputElement).value);
  }

  cancel() {
    this.dialogRef.close();
  }

  save() {
    const userId = localStorage.getItem('userId');
    const next = this.name().trim();
    if (!userId || next.length < 2) return;

    this.saving.set(true);
    this.error.set('');
    this.api.updateUserName({ userId, name: next }).subscribe({
      next: result => {
        localStorage.setItem('userName', result.name);
        this.dialogRef.close(result.name);
      },
      error: error => {
        this.error.set(error.error?.error || error.error?.message || 'Failed to save your name.');
        this.saving.set(false);
      }
    });
  }
}
