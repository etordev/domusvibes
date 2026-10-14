import { Component, inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';

export interface ConfirmDialogData {
  titleKey: string;
  bodyKey: string;
  cancelKey: string;
  confirmKey: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: '../logout-dialog/logout-dialog.component.scss'
})
export class ConfirmDialogComponent {
  private dialogRef = inject(DialogRef<boolean>);
  readonly data = inject<ConfirmDialogData>(DIALOG_DATA);

  stay() {
    this.dialogRef.close(false);
  }

  proceed() {
    this.dialogRef.close(true);
  }
}
