import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, EmailValidator } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, firstValueFrom } from 'rxjs';
import { debounceTime, takeUntil, finalize } from 'rxjs/operators';
import { CompanyForm, CompanyFormComponent } from '../../components/company-form/company-form.component';
import { OnboardingDataService } from '../../services/onboardind-data.service';
import { OnboardingService } from '../../services/onboarding.service';
import { RegisterOwnerWithCompanyRequest } from '../../contracts/RegisterOwnerWithCompanyRequest';
import { ToastrService } from 'ngx-toastr';
import { ErrorHandlingService, isNormalizedError } from '../../../../shared/services/error-handling.service';
import { CreateUserRequest } from '../../../../shared/contracts/CreateUserRequest';
import { CreateCompanyRequest } from '../../../../shared/contracts/CreateCompanyRequest';
import { AddressForm } from '../../components/address-form/address-form.component';
import { cnpjValidator } from '../../../../shared/validators/cnpjValidator';
import { emailValidator } from '../../../../shared/validators/email.validator';
import { cepValidator } from '../../../../shared/validators/cep.validator';

@Component({
  selector: 'app-create-company',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CompanyFormComponent],
  templateUrl: './create-company.component.html',
  styleUrls: ['./create-company.component.scss'],
})
export class CreateCompanyComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private data = inject(OnboardingDataService);
  private onboardingService = inject(OnboardingService);
  private toastr = inject(ToastrService);
  private errorHandler = inject(ErrorHandlingService);

  private destroy$ = new Subject<void>();

  form: FormGroup<CompanyForm>;
  loading = false;

  constructor() {
    this.form = this.fb.group<CompanyForm>({
      companyName: this.fb.control('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      }),
      tradeName: this.fb.control('', {
        nonNullable: true,
        validators: [
          Validators.minLength(3),
          Validators.maxLength(200),
        ],
      }),
      cnpj: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required, cnpjValidator,],
      }),
      companyPhone: this.fb.control('', { nonNullable: true }),
      companyEmail: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.email, emailValidator],
      }),

      address: this.fb.group<AddressForm>({
        street: this.fb.control('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        number: this.fb.control('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        complement: this.fb.control('', { nonNullable: true }),
        neighborhood: this.fb.control('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        city: this.fb.control('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        state: this.fb.control('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        zipCode: this.fb.control('', {
          nonNullable: true,
          validators: [Validators.required, cepValidator],
        }),
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
    if (draftCompany) {
      this.form.patchValue(draftCompany as any, { emitEvent: false });
    }

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

  // ========== Helpers de UI para erros ==========
  // invalid(path: string): boolean {
  //   const c = this.form.get(path);
  //   return !!(c && c.invalid && (c.dirty || c.touched));
  // }

  // firstError(path: string): string {
  //   const c = this.form.get(path);
  //   if (!c || !c.errors) return '';
  //   if (c.errors['server']) return c.errors['server'];
  //   if (c.errors['required']) return 'Campo obrigatório.';
  //   if (c.errors['email']) return 'E-mail inválido.';
  //   return 'Valor inválido.';
  // }

  // private focusGlobalError(): void {
  //   // rola até o banner de erro global; se não houver, rola ao primeiro campo inválido
  //   setTimeout(() => {
  //     const banner = document.querySelector('[role="alert"]') as HTMLElement | null;
  //     if (banner) {
  //       banner.scrollIntoView({ behavior: 'smooth', block: 'start' });
  //       banner.focus?.();
  //       return;
  //     }
  //     const firstInvalid = document.querySelector('.is-invalid') as HTMLElement | null;
  //     firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //   });
  // }

  // ========== Utils de normalização ==========
  private onlyDigits(v: string | null | undefined): string {
    return (v ?? '').replace(/\D+/g, '');
  }
  private toIsoDate(v: string | null | undefined): string {
    const s = (v ?? '').trim();
    if (!s) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    return m ? `${m[3]}-${m[2]}-${m[1]}` : s;
  }

  // ========== Submit ==========
  async finish(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // this.focusGlobalError();
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
        cpf: this.onlyDigits(ownerRaw.profile.cpf),
        rg: ownerRaw.profile.rg ?? '',
        userPhone: this.onlyDigits(ownerRaw.profile.userPhone),
        birthDate: this.toIsoDate(ownerRaw.profile.birthDate),
        address: {
          ...ownerRaw.profile.address,
          zipCode: this.onlyDigits(ownerRaw.profile.address.zipCode),
        },
      },
    };

    const company: CreateCompanyRequest = {
      ...companyRaw,
      cnpj: this.onlyDigits(companyRaw.cnpj),
      companyPhone: this.onlyDigits(companyRaw.companyPhone),
      address: {
        ...companyRaw.address,
        zipCode: this.onlyDigits(companyRaw.address.zipCode),
      },
    };

    const payload: RegisterOwnerWithCompanyRequest = { owner, company };

    this.loading = true;
    this.form.disable({ emitEvent: false });
    try {
      await firstValueFrom(
        this.onboardingService
          .registerOwnerWithCompany(payload)
          .pipe(
            finalize(() => {
              this.form.enable({ emitEvent: false });
              this.loading = false;
            })
          )
      );

      this.data.clearCompanyDraft();
      this.toastr.success('Cadastro realizado com sucesso!', 'Tudo certo', {
        positionClass: 'toast-top-center',
        progressBar: true,
        closeButton: true,
        timeOut: 4000,
      });
      this.router.navigate(['/onboarding/success']);
    } catch (err: unknown) {
      const parsed = isNormalizedError(err) ? err : this.errorHandler.parse(err);
      const status = (parsed as any)?.status ?? (parsed as any)?.error?.status;
      const body = (parsed as any)?.error ?? {};
      const fallbackMsg = parsed?.message || 'Erro inesperado no servidor.';

      const mapped = this.mapErrorsToFields(body);

      if (!mapped) {
        // erro “global” -> banner no topo do card
        this.form.setErrors({ server: body?.message || fallbackMsg });
      }

      this.form.markAllAsTouched();
    }
  }

  /**
   * Mapeia mensagens vindas do back para campos do form.
   * Aceita formatos:
   *  - { field: 'cnpj', message: '...' }
   *  - { path: 'address.zipCode', message: '...' }
   *  - { errors: [{ field|path|name, message }, ...] }
   *  - { fieldErrors: [...] }
   * Retorna true se conseguiu mapear pelo menos um campo.
   */
  private mapErrorsToFields(body: any): boolean {
    let mapped = false;

    const setFieldError = (path?: string, message?: string) => {
      if (!path) return;
      const ctrl = this.resolveControlByPath(path);
      if (ctrl) {
        ctrl.setErrors({ server: message || 'Valor inválido.' });
        mapped = true;
      }
    };

    const list = body?.errors || body?.fieldErrors;
    if (Array.isArray(list) && list.length) {
      for (const fe of list) {
        setFieldError(fe?.field || fe?.path || fe?.name, fe?.message || body?.message);
      }
    }

    if (!mapped && (body?.field || body?.path)) {
      setFieldError(body.field || body.path, body?.message);
    }

    return mapped;
  }

  /** resolve "address.zipCode" ou "cnpj" para o controle correspondente */
  private resolveControlByPath(path?: string): AbstractControl | null {
    if (!path) return null;
    return this.form.get(path) ?? null;
  }
}
