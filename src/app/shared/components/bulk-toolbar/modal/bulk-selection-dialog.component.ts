import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RefineChoice } from '../models/bulk-selection.models';
import { ButtonComponent } from '../../buttons/button/button.component';

@Component({
  selector: 'app-bulk-selection-dialog',
  imports: [
    CommonModule, 
    MatDialogModule,
    ButtonComponent
  ],
  templateUrl: './bulk-selection-dialog.component.html',
  styleUrl: './bulk-selection-dialog.component.scss'
})
export class BulkSelectionDialogComponent {
  constructor(
    private ref: MatDialogRef<BulkSelectionDialogComponent, RefineChoice>,
    @Inject(MAT_DIALOG_DATA) public data: { selectionCount: number }
  ) { }
  close(choice: RefineChoice) { this.ref.close(choice); }
}
