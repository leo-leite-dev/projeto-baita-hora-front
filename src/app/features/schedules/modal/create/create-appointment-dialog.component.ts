import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CustomerForm, CustomerFormComponent } from '../../forms/customer/customer-form.component';
import { AppointmentForm, AppointmentFormComponent } from '../../forms/appointment/appointment-form.component';
import { ButtonComponent } from '../../../../shared/components/buttons/button/button.component';
import { FaIconComponent } from '../../../../shared/components/icons/fa-icon.component';
import { CreateAppointmentRequest } from '../../contracts/appointments/create-appointment-request.contract';
import { SelectableItem } from '../../../../shared/components/inputs/auto-complete/auto-complete.component';
import { cpfValidator } from '../../../../shared/validators/cpf.validator';
import { ServiceOfferingOption } from '../../../companies/service-offerings/models/service-oferring-option.model';

type PickResult =
  | { mode: 'existing'; customerId: string; serviceOfferingIds: string[] } // 👈 atualiza aqui também
  | { mode: 'new'; customerName: string; customerCpf: string; customerPhone: string };

@Component({
  selector: 'app-create-appointment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonToggleModule,
    CustomerFormComponent,
    AppointmentFormComponent,
    ButtonComponent,
    FaIconComponent,
  ],
  templateUrl: './create-appointment-dialog.component.html',
  styleUrls: ['./create-appointment-dialog.component.scss'],
})
export class CreateAppointmentDialogComponent {
  @Output() close = new EventEmitter<void>();

  private readonly dialogRef = inject(
    MatDialogRef<CreateAppointmentDialogComponent, PickResult | undefined>,
  );
  private readonly fb = inject(FormBuilder);

  readonly base = inject(MAT_DIALOG_DATA, { optional: true }) as CreateAppointmentRequest | null;

  mode = this.fb.control<'existing' | 'new'>('existing', { nonNullable: true });

  existingForm = this.fb.group<AppointmentForm>({
    customer: this.fb.control<SelectableItem | null>(null, {
      validators: [Validators.required],
    }),

    serviceOfferings: this.fb.control<ServiceOfferingOption[]>([], {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1)],
    }),
  });

  form: FormGroup<CustomerForm> = this.fb.group<CustomerForm>({
    customerName: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(200)],
    }),
    customerCpf: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required, cpfValidator],
    }),
    customerPhone: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  private normalizeId(v: any): string {
    if (!v) return '';

    if (typeof v === 'string') return v.trim();

    if (typeof v === 'object') {
      const id = v.id ?? v.value ?? v.key;
      return (id ?? '').toString().trim();
    }

    return String(v).trim();
  }

  submitExisting(): void {
    console.log('[CreateAppointmentDialog] submitExisting() called');
    console.log('[CreateAppointmentDialog] existingForm value:', this.existingForm.getRawValue());
    console.log('[CreateAppointmentDialog] existingForm valid:', this.existingForm.valid);

    if (this.existingForm.invalid) {
      console.warn('[CreateAppointmentDialog] existingForm is INVALID, marking as touched');
      this.existingForm.markAllAsTouched();
      return;
    }

    const c = this.existingForm.controls.customer.value!;
    const services = this.existingForm.controls.serviceOfferings.value!;

    console.log('[CreateAppointmentDialog] raw customer control:', c);
    console.log('[CreateAppointmentDialog] raw serviceOfferings control:', services);

    const customerId = this.normalizeId(c);
    const serviceOfferingIds = (services ?? []).map((s) => this.normalizeId(s));

    console.log('[CreateAppointmentDialog] normalized:', {
      customerId,
      serviceOfferingIds,
    });

    if (!customerId || serviceOfferingIds.length === 0) {
      console.warn(
        '[CreateAppointmentDialog] normalized values invalid, NOT closing dialog',
        { customerId, serviceOfferingIdsLength: serviceOfferingIds.length },
      );
      return;
    }

    const result: PickResult = {
      mode: 'existing',
      customerId,
      serviceOfferingIds,
    };

    console.log('[CreateAppointmentDialog] closing dialog with result:', result);

    this.dialogRef.close(result);
  }

  submitNew(): void {
    console.log('[CreateAppointmentDialog] submitNew() called');
    console.log('[CreateAppointmentDialog] form value:', this.form.getRawValue());
    console.log('[CreateAppointmentDialog] form valid:', this.form.valid);

    if (this.form.invalid) {
      console.warn('[CreateAppointmentDialog] NEW form is INVALID, marking as touched');
      this.form.markAllAsTouched();
      return;
    }

    const { customerName, customerCpf, customerPhone } = this.form.getRawValue();

    const result: PickResult = {
      mode: 'new',
      customerName,
      customerCpf,
      customerPhone,
    };

    console.log('[CreateAppointmentDialog] closing dialog with result:', result);

    this.dialogRef.close(result);
  }

  reset(): void {
    console.log('[CreateAppointmentDialog] reset() called');
    this.form.reset();
    this.existingForm.reset();
  }

  closeDialog(): void {
    console.log('[CreateAppointmentDialog] closeDialog() called');
    this.dialogRef.close();
  }
}
