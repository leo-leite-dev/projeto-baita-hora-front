import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Observable, shareReplay, take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { PositionsService } from '../../services/positions.service';
import { ServiceOfferingsService } from '../../../service-offerings/services/service-offerings.service';
import { PositionForm, PositionFormComponent } from '../../form/position-form.component';
import { CompanyRole } from '../../../../../shared/enums/company-role.enum';
import { extractErrorMessage } from '../../../../../shared/utils/error.util';
import { PatchPositionRequest } from '../../contracts/patch-position-request.contract';
import { ServiceOfferingOption } from '../../../service-offerings/models/service-oferring-option.model';
import { GenericModule } from '../../../../../../shareds/common/GenericModule';
import { ButtonComponent } from '../../../../../shared/components/buttons/button/button.component';
import { BackButtonComponent } from '../../../../../shared/components/buttons/back-button/back-button.component';
import { PositionEditView } from '../../models/position-edit-view.model';

@Component({
  selector: 'app-position-edit',
  standalone: true,
  imports: [
    GenericModule,
    PositionFormComponent,
    ButtonComponent,
    BackButtonComponent,
  ],
  templateUrl: './position-edit.component.html',
  styleUrl: './position-edit.component.scss',
})
export class PositionEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private positionsService = inject(PositionsService);
  private serviceOfferingsService = inject(ServiceOfferingsService);
  private toastr = inject(ToastrService);

  private initial!: PositionEditView;
  private id!: string;

  form!: FormGroup<PositionForm>;
  submitting = false;
  loaded = false;

  serviceOfferingOptions$!: Observable<ServiceOfferingOption[]>;

  ngOnInit(): void {
    this.buildForm();
    this.initData();
    this.loadServiceOfferingOptions()
  }

  private initData(): void {
    this.route.data.pipe(take(1)).subscribe(({ item }) => {
      if (!item) {
        this.toastr.error('Cargo não encontrado.');
        this.router.navigate(['/app/position/list']);
        return;
      }

      this.id = item.id;
      this.initial = item;

      this.form.setValue({
        name: item.name ?? '',
        accessLevel: item.accessLevel,
        serviceOfferings: item.serviceOfferings ?? [],
      }, { emitEvent: false });

      this.form.markAsPristine();
      this.loaded = true;
    });
  }

  private loadServiceOfferingOptions(): void {
    this.serviceOfferingOptions$ = this.serviceOfferingsService
      .listServiceOfferingActiveOptions()
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  private buildForm(): void {
    this.form = this.fb.group<PositionForm>({
      name: this.fb.control('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      }),
      accessLevel: this.fb.control<CompanyRole>(CompanyRole.Viewer, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      serviceOfferings: this.fb.control<ServiceOfferingOption[]>([], {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(1),
        ],
      }),
    });
  }

  submit(): void {
    if (this.form.invalid || !this.id) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const diff: PatchPositionRequest = {};

    if (raw.name !== this.initial.name)
      diff.name = raw.name;

    if (raw.accessLevel !== this.initial.accessLevel)
      diff.accessLevel = CompanyRole[raw.accessLevel] as keyof typeof CompanyRole;

    const initialServiceIds = (this.initial.serviceOfferings ?? [])
      .map(s => String(s.id))
      .sort();

    const currentServiceIds = (raw.serviceOfferings ?? [])
      .map(s => String(s.id))
      .sort();

    const sameServices = initialServiceIds.join('|') === currentServiceIds.join('|');

    if (!sameServices)
      diff.serviceOfferingIds = currentServiceIds;

    this.submitting = true;
    this.form.disable();

    this.positionsService.patch(this.id, diff)
      .pipe(
        take(1),
        finalize(() => {
          this.submitting = false;
          this.form.enable({ emitEvent: false });
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success('Cargo atualizado!');
          this.router.navigate(['/app/position/list']);
        },
        error: (err) => {
          const status: number | undefined = err?.status;
          const msg = extractErrorMessage(err) || 'Falha ao atualizar cargo.';

          if (status === 409) {
            this.toastr.warning(msg, 'Atenção', {
              toastClass: 'ngx-toastr custom-toast toast-warning',
            });
            this.form.get('name')?.setErrors({ duplicate: true });
            return;
          }

          this.form.setErrors({ server: msg });
          this.toastr.error(msg);
        },
      });
  }

  revert(): void {
    if (!this.initial)
      return;

    this.form.setValue({
      name: this.initial.name ?? '',
      accessLevel: this.initial.accessLevel,
      serviceOfferings: this.initial.serviceOfferings ?? [],
    }, { emitEvent: false });

    this.form.markAsPristine();
  }
}