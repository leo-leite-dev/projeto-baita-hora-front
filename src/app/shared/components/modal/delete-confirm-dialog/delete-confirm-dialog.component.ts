import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ButtonComponent } from '../../buttons/button/button.component';

export interface DeleteDialogData {
  id: string | number;
  name?: string;
}

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    ButtonComponent
  ],
  templateUrl: './delete-confirm-dialog.component.html',
})
export class DeleteConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<DeleteConfirmDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteDialogData
  ) { }

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    this.dialogRef.close(true);
  }
}