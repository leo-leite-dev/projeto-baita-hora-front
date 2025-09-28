import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { finalize, take } from 'rxjs/operators';
import { ServiceOfferingForm, ServiceOfferingFormComponent } from '../../form/service-offering-form.component'; // se for COMPONENT, adicione-o nos imports do @Component
import { CreateServiceOfferingRequest } from '../../contracts/CreateServiceOfferingRequest';
import { ToastrService } from 'ngx-toastr';
import { ButtonComponent } from '../../../../../shared/components/buttons/button/button.component';
import { extractErrorMessage } from '../../../../../shared/utils/error.util';
import { ServiceOfferingsService } from '../../services/service-offerings.service';
import { BackButtonComponent } from '../../../../../shared/components/buttons/back-button/back-button.component';

@Component({
  selector: 'app-service-offering-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ServiceOfferingFormComponent,
    ButtonComponent,
    BackButtonComponent
  ],
  templateUrl: './service-offering-create.component.html',
  styleUrls: ['./service-offering-create.component.scss']
})
export class ServiceOfferingCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ServiceOfferingsService);
  private toastr = inject(ToastrService);

  form!: FormGroup<ServiceOfferingForm>;
  submitting = false;

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group<ServiceOfferingForm>({
      serviceOfferingName: this.fb.control('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50)
        ],
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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { serviceOfferingName, price, currency } = this.form.getRawValue();

    const payload: CreateServiceOfferingRequest = {
      serviceOfferingName,
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
          this.form.reset({
            serviceOfferingName: '',
            price: 0,
            currency: 'BRL',
          });
        },
        error: (err) => {
          const status: number | undefined = err?.status;
          const msg = extractErrorMessage(err);

          if (status === 409) {
            this.toastr.warning(msg, 'Atenção', {
              toastClass: 'ngx-toastr custom-toast toast-warning',
            });

            this.form.get('serviceOfferingName')?.setErrors({ duplicate: true });
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