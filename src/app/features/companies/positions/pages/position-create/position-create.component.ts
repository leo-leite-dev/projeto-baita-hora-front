import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { finalize, shareReplay, take } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { PositionsService } from "../../services/positions.service";
import { ServiceOfferingsService } from "../../../service-offerings/services/service-offerings.service";
import { CompanyRole } from "../../../../../shared/enums/company-role.enum";
import { PositionForm, PositionFormComponent } from "../../form/position-form.component";
import { extractErrorMessage } from "../../../../../shared/utils/error.util";
import { CreatePositionRequest } from "../../contracts/CreatePositionRequest";
import { ServiceDto } from "../../models/position.model";
import { ButtonComponent } from "../../../../../shared/components/buttons/button/button.component";
import { BackButtonComponent } from "../../../../../shared/components/buttons/back-button/back-button.component";

@Component({
  standalone: true,
  selector: 'app-position-create',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    BackButtonComponent,
    PositionFormComponent
  ],
  templateUrl: './position-create.component.html'
})
export class PositionCreateComponent {
  private fb = inject(FormBuilder);
  private positionsService = inject(PositionsService);
  private serviceOfferingsService = inject(ServiceOfferingsService);
  private toastr = inject(ToastrService);

  form!: FormGroup<PositionForm>;
  submitting = false;

  serviceOfferingOptions$ = this.serviceOfferingsService.listAll().pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor() {
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group<PositionForm>({
      positionName: this.fb.control('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50)
        ],
      }),
      accessLevel: this.fb.control(CompanyRole.Viewer, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      serviceOfferings: this.fb.control<ServiceDto[]>([], {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(1)],
      }),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { positionName, accessLevel, serviceOfferings } = this.form.getRawValue();

    const payload: CreatePositionRequest = {
      positionName: positionName,
      accessLevel,
      serviceOfferingIds: (serviceOfferings ?? []).map(s => s.id),
    };

    this.submitting = true;
    this.form.disable();

    this.positionsService.create(payload)
      .pipe(
        take(1),
        finalize(() => {
          this.submitting = false;
          this.form.enable();
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success('Posição criada com sucesso!');
          this.form.reset({
            positionName: '',
            accessLevel: CompanyRole.Viewer,
            serviceOfferings: [],
          });
        },
        error: (err) => {
          const status: number | undefined = err?.status;
          const msg = extractErrorMessage(err);

          if (status === 409) {
            this.toastr.warning(msg, 'Atenção', { toastClass: 'ngx-toastr custom-toast toast-warning' });
            this.form.get('positionName')?.setErrors({ duplicate: true });
            return;
          }
          this.form.setErrors({ server: msg });
        },
      });
  }

  reset(): void {
    this.form.reset({
      positionName: '',
      accessLevel: CompanyRole.Viewer,
      serviceOfferings: [],
    });
  }
}