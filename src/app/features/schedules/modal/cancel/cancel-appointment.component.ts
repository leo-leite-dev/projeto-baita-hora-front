import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

export type CancelDialogResult = 'cancel' | 'noShow' | 'close';

@Component({
  selector: 'app-cancel-appointment',
  standalone: true,
  imports: [],
  templateUrl: './cancel-appointment.component.html',
  styleUrl: './cancel-appointment.component.scss',
})
export class CancelAppointmentDialogComponent {
  constructor(
    private ref: MatDialogRef<CancelAppointmentDialogComponent, CancelDialogResult>
  ) { }

  onClose() {
    this.ref.close('close');
  }

  onCancel() {
    this.ref.close('cancel');
  }

  onNoShow() {
    this.ref.close('noShow');
  }
}