import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize, take } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { ServiceOffering } from '../../models/ServiceOffering.model';
import { PatchServiceOfferingRequest } from '../../contracts/PatchServiceOfferingRequest';
import { ServiceOfferingForm, ServiceOfferingFormComponent } from '../../form/service-offering-form.component';
import { ButtonComponent } from '../../../../../shared/components/buttons/button/button.component';
import { AuthService } from '../../../../../core/auth/services/auth.service';
import { extractErrorMessage } from '../../../../../shared/utils/error.util';
import { ServiceOfferingsService } from '../../services/service-offerings.service';
import { BackButtonComponent } from '../../../../../shared/components/buttons/back-button/back-button.component';

@Component({
  selector: 'app-edit-service-offering',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ServiceOfferingFormComponent,
    ButtonComponent,
    BackButtonComponent
  ],
  templateUrl: './service-offering-edit.component.html',
  styleUrls: ['./service-offering-edit.component.scss']
})
export class ServiceOfferingEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ServiceOfferingsService);
  private toastr = inject(ToastrService);
  private auth = inject(AuthService);

  form!: FormGroup<ServiceOfferingForm>;
  submitting = false;
  loaded = false;

  private initial!: ServiceOffering;
  private id!: string;

  private get companyId(): string {
    return this.auth.getActiveCompany() ?? '';
  }

  ngOnInit(): void {
    this.buildForm();

    this.route.paramMap.pipe(take(1)).subscribe(params => {
      const id = params.get('id');
      if (!id) {
        this.toastr.error('ID inválido.');
        this.router.navigateByUrl('/app/service-offering');
        return;
      }
      this.id = id;
      this.load();
    });
  }

  private buildForm(): void {
    this.form = this.fb.group<ServiceOfferingForm>({
      serviceOfferingName: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
      }),
      price: this.fb.control(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0.01)],
      }),
      currency: this.fb.control('BRL', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^[A-Z]{3}$/)],
      }),
    });
  }

  private load(): void {
    this.service.getById(this.id)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.initial = data;
          this.form.setValue({
            serviceOfferingName: data.name ?? '',
            price: data.price ?? 0,
            currency: data.currency ?? 'BRL',
          }, { emitEvent: false });
          this.form.markAsPristine();
          this.loaded = true;
        },
        error: (err) => {
          this.toastr.error(extractErrorMessage(err) || 'Falha ao carregar oferta.');
          this.router.navigateByUrl('/app/service-offering');
        }
      });
  }

  submit(): void {
    if (this.form.invalid || !this.id) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.companyId) {
      console.error('companyId ausente na rota.');
      return;
    }

    const raw = this.form.getRawValue();
    const diff: PatchServiceOfferingRequest = {};

    if (raw.serviceOfferingName !== this.initial.name) {
      diff.serviceOfferingName = raw.serviceOfferingName;
    }
    if (raw.price !== this.initial.price) {
      diff.amount = raw.price;
    }
    if (raw.currency !== this.initial.currency) {
      diff.currency = raw.currency;
    }

    if (Object.keys(diff).length === 0) {
      this.toastr.info('Nada para salvar.');
      return;
    }

    this.submitting = true;
    this.form.disable();

    this.service.patch(this.id, diff)
      .pipe(
        take(1),
        finalize(() => {
          this.submitting = false;
          this.form.enable();
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success('Oferta de serviço atualizada!');
          this.initial = {
            ...this.initial,
            name: diff.serviceOfferingName ?? this.initial.name,
            price: diff.amount ?? this.initial.price,
            currency: diff.currency ?? this.initial.currency,
          };
          this.form.markAsPristine();
        },
        error: (err) => {
          const status: number | undefined = err?.status;
          const msg = extractErrorMessage(err);

          if (status === 409) {
            this.toastr.warning(msg, 'Atenção', { toastClass: 'ngx-toastr custom-toast toast-warning' });
            this.form.get('serviceOfferingName')?.setErrors({ duplicate: true });
            return;
          }
          this.form.setErrors({ server: msg });
        }
      });
  }

  revert(): void {
    if (!this.initial) return;
    this.form.setValue({
      serviceOfferingName: this.initial.name ?? '',
      price: this.initial.price ?? 0,
      currency: this.initial.currency ?? 'BRL',
    });
    this.form.markAsPristine();
  }
}