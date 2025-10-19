import { ToastrService } from 'ngx-toastr';
import { Component, inject, OnInit } from '@angular/core';
import { finalize, take } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceOfferingsService } from '../../services/service-offerings.service';
import { CreateServiceOfferingRequest } from '../../contracts/create-service-offering.contract';
import { ServiceOfferingForm, ServiceOfferingFormComponent } from '../../form/service-offering-form.component';
import { extractErrorMessage } from '../../../../../shared/utils/error.util';
import { GenericModule } from '../../../../../../shareds/common/GenericModule';

@Component({
  selector: 'app-service-offering-create',
  standalone: true,
  imports: [GenericModule, ServiceOfferingFormComponent],
  templateUrl: './service-offering-create.component.html',
  styleUrls: ['./service-offering-create.component.scss']
})
export class ServiceOfferingCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ServiceOfferingsService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  form!: FormGroup<ServiceOfferingForm>;
  submitting = false;

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group<ServiceOfferingForm>({
      name: this.fb.control('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      }),
      price: this.fb.control(0, {
        nonNullable: true,
        updateOn: 'change',
        validators: [Validators.required, Validators.min(0.01)],
      }),
      currency: this.fb.control('BRL', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^[A-Z]{3}$/)],
      }),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, price, currency } = this.form.getRawValue();

    const payload: CreateServiceOfferingRequest = {
      name,
      amount: price,
      currency,
    };

    this.submitting = true;
    this.form.disable();

    this.service.createServiceOffering(payload)
      .pipe(
        take(1),
        finalize(() => {
          this.submitting = false;
          this.form.enable();
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success('Oferta de serviço criada com sucesso!');
          this.router.navigate(['/app/service-offering/list']);
        },
        error: (err) => {
          const status: number | undefined = err?.status;
          const msg = extractErrorMessage(err);

          if (status === 409) {
            this.toastr.warning(msg, 'Atenção', {
              toastClass: 'ngx-toastr custom-toast toast-warning',
            });

            this.form.get('name')?.setErrors({ duplicate: true });
            return;
          }
          this.form.setErrors({ server: msg });
        },
      });
  }

  reset(): void {
    this.form.reset();
  }
}