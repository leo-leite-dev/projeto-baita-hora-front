import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ServiceOffering } from '../../models/service-offering.model';
import { ServiceOfferingForm, ServiceOfferingFormComponent } from '../../form/service-offering-form.component';
import { ButtonComponent } from '../../../../../shared/components/buttons/button/button.component';
import { BackButtonComponent } from '../../../../../shared/components/buttons/back-button/back-button.component';
import { GenericModule } from '../../../../../../shareds/common/GenericModule';
import { extractErrorMessage } from '../../../../../shared/utils/error.util';
import { ServiceOfferingsService } from '../../services/service-offerings.service';
import { PatchServiceOfferingRequest } from '../../contracts/patch-service-offering.contract';

@Component({
  selector: 'app-edit-service-offering',
  standalone: true,
  imports: [
    GenericModule,
    ServiceOfferingFormComponent,
    ButtonComponent,
    BackButtonComponent,
  ],
  templateUrl: './service-offering-edit.component.html',
  styleUrls: ['./service-offering-edit.component.scss'],
})
export class ServiceOfferingEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ServiceOfferingsService);
  private toastr = inject(ToastrService);

  form!: FormGroup<ServiceOfferingForm>;
  submitting = false;
  loaded = false;

  private initial!: ServiceOffering;
  private id!: string;

  ngOnInit(): void {
    this.buildForm();
    this.initData();
  }

  private initData(): void {
    this.route.data.pipe(take(1)).subscribe(({ item }) => {
      if (!item) {
        this.toastr.error('Oferta de serviço não encontrada.');
        this.router.navigate(['/app/service-offering/list']);
        return;
      }

      this.id = item.id;
      this.initial = item;

      this.form.setValue(
        {
          name: item.name ?? '',
          price: item.price ?? 0,
          currency: item.currency ?? 'BRL',
        },
        { emitEvent: false }
      );

      this.form.markAsPristine();
      this.loaded = true;
    });
  }

  private buildForm(): void {
    this.form = this.fb.group<ServiceOfferingForm>({
      name: this.fb.control('', {
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

  submit(): void {
    if (this.form.invalid || !this.id) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const diff: PatchServiceOfferingRequest = {};

    if (raw.name !== this.initial.name)
      diff.name = raw.name;

    if (raw.price !== this.initial.price)
      diff.amount = raw.price;

    if (raw.currency !== this.initial.currency)
      diff.currency = raw.currency;

    if (Object.keys(diff).length === 0) {
      this.toastr.info('Nada para salvar.');
      return;
    }

    this.submitting = true;
    this.form.disable();

    this.service
      .patch(this.id, diff)
      .pipe(
        take(1),
        finalize(() => {
          this.submitting = false;
          this.form.enable({ emitEvent: false });
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success('Oferta de serviço atualizada!');
          this.router.navigate(['/app/service-offering/list']);
        },
        error: (err) => {
          const status: number | undefined = err?.status;
          const msg = extractErrorMessage(err) || 'Falha ao atualizar a oferta de serviço.';

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
    if (!this.initial) return;

    this.form.setValue(
      {
        name: this.initial.name ?? '',
        price: this.initial.price ?? 0,
        currency: this.initial.currency ?? 'BRL',
      },
      { emitEvent: false }
    );

    this.form.markAsPristine();
  }
}