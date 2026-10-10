import { Component, inject } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-logout-dialog',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './logout-dialog.component.html',
  styleUrl: './logout-dialog.component.scss'
})
export class LogoutDialogComponent {
  private dialogRef = inject(DialogRef<boolean>);

  stay() {
    this.dialogRef.close(false);
  }

  leave() {
    this.dialogRef.close(true);
  }
}
