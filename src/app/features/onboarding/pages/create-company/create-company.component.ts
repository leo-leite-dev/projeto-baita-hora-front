import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, finalize, take } from 'rxjs/operators';
import { OnboardingDataService } from '../../services/onboardind-data.service';
import { OnboardingService } from '../../services/onboarding.service';
import { ToastrService } from 'ngx-toastr';
import { CreateUserRequest } from '../../../../shared/contracts/user-request';
import { CreateCompanyRequest } from '../../../../shared/contracts/company-request';
import { cnpjValidator } from '../../../../shared/validators/cnpjValidator';
import { emailValidator } from '../../../../shared/validators/email.validator';
import { cepValidator } from '../../../../shared/validators/cep.validator';
import { ButtonComponent } from '../../../../shared/components/buttons/button/button.component';
import { AddressForm } from '../../../../shared/components/forms/address-form/address-form.component';
import { CompanyForm, CompanyFormComponent } from '../../forms/company-form/company-form.component';
import { onlyDigits, toIsoDate } from '../../../../shared/utils/string.util';
import { FormHeaderComponent } from '../../../../shared/components/forms/form-header/form-header.component';
import { BackButtonComponent } from '../../../../shared/components/buttons/back-button/back-button.component';
import { extractErrorMessage } from '../../../../shared/utils/error.util';
import { RegisterOwnerWithCompanyRequest } from '../../contracts/owner-request';

@Component({
  selector: 'app-create-company',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CompanyFormComponent,
    ButtonComponent,
    BackButtonComponent,
    FormHeaderComponent
  ],
  templateUrl: './create-company.component.html',
  styleUrls: ['./create-company.component.scss'],
})
export class CreateCompanyComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private data = inject(OnboardingDataService);
  private onboardingService = inject(OnboardingService);
  private toastr = inject(ToastrService);
  private destroy$ = new Subject<void>();

  form: FormGroup<CompanyForm>;
  loading = false;

  constructor() {
    this.form = this.fb.group<CompanyForm>({
      companyName: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
      }),
      tradeName: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.minLength(3), Validators.maxLength(200)],
      }),
      cnpj: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required, cnpjValidator],
      }),
      companyPhone: this.fb.control('', { nonNullable: true }),
      companyEmail: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.email, emailValidator],
      }),
      address: this.fb.group<AddressForm>({
        street: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
        number: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
        complement: this.fb.control('', { nonNullable: true }),
        neighborhood: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
        city: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
        state: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
        zipCode: this.fb.control('', { nonNullable: true, validators: [Validators.required, cepValidator] }),
      }),
    });
  }

  ngOnInit(): void {
    const hasOwner = !!(this.data.ownerDraft ?? this.data.snapshot.owner);
    if (!hasOwner) {
      this.router.navigate(['/onboarding/create-owner']);
      return;
    }

    const draftCompany = this.data.companyDraft ?? this.data.snapshot.company ?? null;
    if (draftCompany) this.form.patchValue(draftCompany as any, { emitEvent: false });

    this.form.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        const raw = this.form.getRawValue() as Partial<CreateCompanyRequest>;
        this.data.saveCompanyDraft(raw);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  back(): void {
    this.router.navigate(['/onboarding/create-owner']);
  }

  finish(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const ownerRaw = (this.data.ownerDraft ?? this.data.snapshot.owner) as CreateUserRequest | undefined;
    if (!ownerRaw) {
      this.router.navigate(['/onboarding/create-owner']);
      return;
    }

    const companyRaw = this.form.getRawValue() as CreateCompanyRequest;

    const owner: CreateUserRequest = {
      ...ownerRaw,
      profile: {
        ...ownerRaw.profile,
        cpf: onlyDigits(ownerRaw.profile.cpf),
        rg: ownerRaw.profile.rg ?? '',
        phone: onlyDigits(ownerRaw.profile.phone),
        birthDate: toIsoDate(ownerRaw.profile.birthDate),
        address: {
          ...ownerRaw.profile.address,
          number: String((ownerRaw.profile.address as any).number ?? '').trim(),
          complement: ownerRaw.profile.address.complement ?? null,
          zipCode: onlyDigits(ownerRaw.profile.address.zipCode),
        },
      },
    };

    const company: CreateCompanyRequest = {
      ...companyRaw,
      cnpj: onlyDigits(companyRaw.cnpj),
      companyPhone: onlyDigits(companyRaw.companyPhone),
      address: {
        ...companyRaw.address,
        number: String((companyRaw.address as any).number ?? '').trim(),
        complement: companyRaw.address.complement ?? null,
        zipCode: onlyDigits(companyRaw.address.zipCode),
      },
    };

    const body: RegisterOwnerWithCompanyRequest = {
      owner,
      company,
    };

    this.loading = true;
    this.form.disable();

    this.onboardingService.registerOwnerWithCompany(body)
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false;
          this.form.enable();
        })
      )
      .subscribe({
        next: () => {
          this.data.clearCompanyDraft();
          this.toastr.success('Cadastro realizado com sucesso!', '', {
            positionClass: 'toast-bottom-right',
            progressBar: true,
            closeButton: true,
            timeOut: 4000,
          });
          this.router.navigate(['/onboarding/success']);
        },
        error: (err) => {
          const msg = extractErrorMessage(err);

          this.form.setErrors({ server: msg });
          this.form.markAllAsTouched();
        }
      });
  }

  reset(): void {
    this.form.reset();
    this.data.clearCompanyDraft();
  }
}