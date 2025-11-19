import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';

export type AttendanceDialogResult = 'attended' | 'noShow' | 'later';

@Component({
  selector: 'app-attendance-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-dialog.component.html',
  styleUrls: ['./attendance-dialog.component.scss'],
})
export class AttendanceDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<AttendanceDialogComponent>,
  ) { }

  closeDialog(): void {
    this.dialogRef.close('later');
  }

  choose(result: AttendanceDialogResult): void {
    this.dialogRef.close(result);
  }
}