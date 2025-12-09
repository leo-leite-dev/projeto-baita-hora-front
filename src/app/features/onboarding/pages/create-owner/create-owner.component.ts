import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OnboardingDataService } from '../../services/onboardind-data.service';
import { cepValidator } from '../../../../shared/validators/cep.validator';
import { mustMatch, passwordStrength } from '../../../../shared/validators/password.validators';
import { cpfValidator } from '../../../../shared/validators/cpf.validator';
import { rgValidator } from '../../../../shared/validators/rg.validator';
import { debounceTime } from 'rxjs/operators';
import { emailValidator } from '../../../../shared/validators/email.validator';
import { adultOnlyValidator, dateValidator, maxDateTodayValidator, minDate1900Validator } from '../../../../shared/validators/date.validators';
import { ButtonComponent } from '../../../../shared/components/buttons/button/button.component';
import { OwnerFormComponent } from '../../forms/owner-form/owner-form.component';
import { AddressForm } from '../../../../shared/components/forms/address-form/address-form.component';
import { ProfileForm } from '../../../../shared/components/forms/profile-form/profile-form.component';
import { AccountForm } from '../../../../shared/components/forms/account-form/account-form.component';
import { GenericModule } from '../../../../../shareds/common/GenericModule';

type RootOwnerForm = {
  owner: FormGroup<AccountForm>;
};

@Component({
  selector: 'app-create-owner',
  standalone: true,
  imports: [
    GenericModule,
    OwnerFormComponent,
    ButtonComponent
  ],
  templateUrl: './create-owner.component.html',
  styleUrls: ['./create-owner.component.scss']
})
export class CreateOwnerComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private data = inject(OnboardingDataService);

  form!: FormGroup<RootOwnerForm>;

  ngOnInit(): void {
    this.buildForm();

    const draftForForm = this.data.getOwnerDraftForForm();
    if (draftForForm)
      this.ownerGroup.patchValue(draftForForm as any, { emitEvent: false });

    this.ownerGroup.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        const { confirmPassword, ...owner } = this.ownerGroup.getRawValue();
        this.data.saveOwnerDraftFromForm(owner as any);
      });
  }

  private buildForm(): void {
    this.form = this.fb.group<RootOwnerForm>({
      owner: this.fb.group<AccountForm>(
        {
          email: this.fb.control('', {
            nonNullable: true,
            validators: [Validators.required, emailValidator],
          }),
          username: this.fb.control('', {
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
            fullName: this.fb.control('', {
              nonNullable: true,
              validators: [Validators.required, Validators.minLength(3), Validators.maxLength(200)],
            }),
            cpf: this.fb.control('', {
              nonNullable: true,
              validators: [Validators.required, cpfValidator],
            }),
            rg: this.fb.control<string | null>(null, {
              validators: [rgValidator],
            }),
            phone: this.fb.control('', {
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
        },
        { validators: mustMatch('rawPassword', 'confirmPassword') }
      ),
    });
  }

  continue(): void {
    const ownerGroup = this.ownerGroup;

    if (ownerGroup.invalid) {
      ownerGroup.markAllAsTouched();
      return;
    }

    const { confirmPassword, ...owner } = ownerGroup.getRawValue();

    this.data.setOwnerFromForm(owner as any);

    this.router.navigate(['/onboarding/create-company']);
  }

  reset(): void {
    this.ownerGroup.reset({
      email: '',
      username: '',
      rawPassword: '',
      confirmPassword: '',
      profile: {
        fullName: '',
        cpf: '',
        rg: null,
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
    }, { emitEvent: false });

    this.ownerGroup.markAsPristine();
    this.ownerGroup.markAsUntouched();
    this.ownerGroup.updateValueAndValidity({ emitEvent: false });

    this.data.clearAll();
  }

  get ownerGroup(): FormGroup<AccountForm> {
    return this.form.controls.owner;
  }
}