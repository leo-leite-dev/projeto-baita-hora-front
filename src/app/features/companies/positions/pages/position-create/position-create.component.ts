import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, shareReplay, take } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { PositionsService } from "../../services/positions.service";
import { ServiceOfferingsService } from "../../../service-offerings/services/service-offerings.service";
import { CompanyRole } from "../../../../../shared/enums/company-role.enum";
import { PositionForm, PositionFormComponent } from "../../form/position-form.component";
import { extractErrorMessage } from "../../../../../shared/utils/error.util";
import { CreatePositionRequest } from "../../contracts/position-request.contract";
import { GenericModule } from "../../../../../../shareds/common/GenericModule";
import { Router } from "@angular/router";
import { ServiceOfferingOption } from "../../../service-offerings/models/service-offering.model";

@Component({
  standalone: true,
  selector: 'app-position-create',
  imports: [
    GenericModule,
    PositionFormComponent
  ],
  templateUrl: './position-create.component.html'
})
export class PositionCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private positionsService = inject(PositionsService);
  private serviceOfferingsService = inject(ServiceOfferingsService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  form!: FormGroup<PositionForm>;
  submitting = false;

  serviceOfferingOptions$ = this.serviceOfferingsService
    .listServiceOfferingActiveOptions()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group<PositionForm>({
      name: this.fb.control('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50)
        ],
      }),
      accessLevel: this.fb.control(CompanyRole.Staff, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      serviceOfferings: this.fb.control<ServiceOfferingOption[]>([], {
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

    const { name, accessLevel, serviceOfferings } = this.form.getRawValue();

    const accessLevelNum = Number(accessLevel);

    const payload: CreatePositionRequest = {
      name,
      accessLevel: accessLevelNum as unknown as CompanyRole,
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
          this.toastr.success('Cargo criado com sucesso!');
          this.router.navigate(['/app/position/list']);
        },
        error: (err) => {
          const status: number | undefined = err?.status;
          const msg = extractErrorMessage(err);

          if (status === 409) {
            this.toastr.warning(msg, 'Atenção', { toastClass: 'ngx-toastr custom-toast toast-warning' });
            this.form.get('name')?.setErrors({ duplicate: true });
            return;
          }
          this.form.setErrors({ server: msg });
        },
      });
  }

  reset(): void {
    this.form.reset({
      name: '',
      accessLevel: CompanyRole.Viewer,
      serviceOfferings: [],
    });
  }
}