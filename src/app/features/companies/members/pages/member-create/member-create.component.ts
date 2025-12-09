import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, shareReplay, take } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GenericModule } from '../../../../../../shareds/common/GenericModule';
import { MemberCreateForm, MemberCreateFormComponent } from '../../form/member-create-form/member-create-form.component';
import { PositionsService } from '../../../positions/services/positions.service';
import { MembersService } from '../../services/member.service';
import { emailValidator } from '../../../../../shared/validators/email.validator';
import { cepValidator } from '../../../../../shared/validators/cep.validator';
import { cpfValidator } from '../../../../../shared/validators/cpf.validator';
import { rgValidator } from '../../../../../shared/validators/rg.validator';
import { mustMatch, passwordStrength } from '../../../../../shared/validators/password.validators';
import { adultOnlyValidator, dateValidator, maxDateTodayValidator, minDate1900Validator } from '../../../../../shared/validators/date.validators';
import { extractErrorMessage } from '../../../../../shared/utils/error.util';
import { CreateUserRequest } from '../../../../../shared/contracts/user-request';
import { onlyDigits, toIsoDate } from '../../../../../shared/utils/string.util';
import { AddressForm } from '../../../../../shared/components/forms/address-form/address-form.component';
import { ProfileForm } from '../../../../../shared/components/forms/profile-form/profile-form.component';
import { AccountForm } from '../../../../../shared/components/forms/account-form/account-form.component';

@Component({
  selector: 'app-member-create',
  standalone: true,
  imports: [
    GenericModule,
    MemberCreateFormComponent,
  ],
  templateUrl: './member-create.component.html',
  styleUrls: ['./member-create.component.scss'],
})
export class MemberCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private positionsService = inject(PositionsService);
  private membersService = inject(MembersService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  form!: FormGroup<MemberCreateForm>;
  submitting = false;

  positionOptions$ = this.positionsService.listAll()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group<MemberCreateForm>({
      positionId: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      Member: this.fb.group<AccountForm>({
        email: this.fb.control('joao.marcos@example.com', {
          nonNullable: true,
          validators: [Validators.required, emailValidator],
        }),
        username: this.fb.control('joao.marcos', {
          nonNullable: true,
          validators: [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
        }),
        rawPassword: this.fb.control('', {
          nonNullable: true,
          validators: [Validators.required, Validators.maxLength(50), passwordStrength(8)],
        }),
        confirmPassword: this.fb.control('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        profile: this.fb.group<ProfileForm>({
          fullName: this.fb.control('João Marcos', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(3), Validators.maxLength(200)],
          }),
          cpf: this.fb.control('59671483020', {
            nonNullable: true,
            validators: [Validators.required, cpfValidator],
          }),
          rg: this.fb.control('123456789', {
            nonNullable: true,
            validators: [rgValidator],
          }),
          phone: this.fb.control('51 99876-2233', {
            nonNullable: true,
            validators: [Validators.required],
          }),
          birthDate: this.fb.control<Date | null>(null, {
            validators: [dateValidator, adultOnlyValidator, minDate1900Validator, maxDateTodayValidator],
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
        }),
      }, { validators: mustMatch('rawPassword', 'confirmPassword') }),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { positionId, Member } = this.form.getRawValue();
    const { confirmPassword, ...user } = Member;

    const employeeRequest: CreateUserRequest = {
      ...user,
      profile: {
        ...user.profile,
        cpf: onlyDigits(user.profile.cpf),
        rg: user.profile.rg ?? '',
        phone: onlyDigits(user.profile.phone),
        birthDate: toIsoDate(user.profile.birthDate),
        address: {
          ...user.profile.address,
          number: String(user.profile.address.number ?? '').trim(),
          zipCode: onlyDigits(user.profile.address.zipCode),
        },
      },
    };

    const payload = {
      positionId,
      employee: employeeRequest,
    };

    this.submitting = true;
    this.form.disable();
    this.membersService.create(payload)
      .pipe(
        take(1),
        finalize(() => {
          this.submitting = false;
          this.form.enable();
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success('Membro criado com sucesso!');
          this.router.navigate(['/members']);
        },
        error: (err) => {
          const status: number | undefined = err?.status;
          const msg = extractErrorMessage(err);

          if (status === 409) {
            this.toastr.warning(msg, 'Atenção', {
              toastClass: 'ngx-toastr custom-toast toast-warning',
            });
            this.form.get('Member.email')?.setErrors({ duplicate: true });
            this.form.get('Member.username')?.setErrors({ duplicate: true });
            return;
          }

          this.form.setErrors({ server: msg });
        },
      });
  }

  reset(): void {
    this.form.reset({
      positionId: '',
      Member: {
        email: '',
        username: '',
        rawPassword: '',
        confirmPassword: '',
        profile: {
          fullName: '',
          cpf: '',
          rg: '',
          phone: '',
          birthDate: null,
          address: {
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: '',
          },
        },
      },
    });
  }
}