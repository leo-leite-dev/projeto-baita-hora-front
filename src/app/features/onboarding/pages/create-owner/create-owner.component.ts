import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
import { OwnerForm, OwnerFormComponent, ProfileForm } from '../../forms/owner-form/owner-form.component';
import { AddressForm } from '../../forms/address-form/address-form.component';

type RootOwnerForm = { owner: FormGroup<OwnerForm> };

@Component({
  selector: 'app-create-owner',
  standalone: true,
  imports: [
    ReactiveFormsModule,
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

    const draft = this.data.ownerDraft ?? this.data.snapshot.owner ?? null;
    if (draft) {
      this.form.controls.owner.patchValue(draft as any, { emitEvent: false });
    }

    this.form.controls.owner.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        const raw = this.form.controls.owner.getRawValue();
        this.data.saveOwnerDraft(raw as any);
      });
  }

  private buildForm(): void {
    this.form = this.fb.group<{ owner: FormGroup<OwnerForm> }>({
      owner: this.fb.group<OwnerForm>(
        {
          userEmail: this.fb.control('', {
            nonNullable: true,
            validators: [Validators.required, emailValidator],
          }),
          username: this.fb.control('', {
            nonNullable: true,
            validators: [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(50),
            ],
          }),
          rawPassword: this.fb.control('', {
            nonNullable: true,
            validators: [
              Validators.required,
              Validators.maxLength(50),
              passwordStrength(8),
            ],
          }),
          confirmPassword: this.fb.control('', {
            nonNullable: true,
            validators: [Validators.required],
          }),
          profile: this.fb.group<ProfileForm>({
            fullName: this.fb.control('', {
              nonNullable: true,
              validators: [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(200),
              ],
            }),
            cpf: this.fb.control('', {
              nonNullable: true,
              validators: [Validators.required, cpfValidator],
            }),
            rg: this.fb.control('', {
              nonNullable: true,
              validators: [rgValidator],
            }),
            userPhone: this.fb.control('', {
              nonNullable: true,
              validators: [Validators.required,],
            }),
            birthDate: this.fb.control('', {
              nonNullable: true,
              validators: [dateValidator, adultOnlyValidator, minDate1900Validator, maxDateTodayValidator],
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
              complement: this.fb.control('', {
                nonNullable: true,
              }),
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
          }),
        },
        {
          validators: mustMatch('rawPassword', 'confirmPassword'),
        }
      ),
    });
  }

  continue(): void {
    const ownerGroup = this.form.controls.owner;

    if (ownerGroup.invalid) {
      ownerGroup.markAllAsTouched();
      return;
    }

    const { confirmPassword, ...owner } = ownerGroup.getRawValue();

    this.data.setOwner(owner);

    this.router.navigate(['/onboarding/create-company']);
  }

  reset(): void {
    this.form.reset();
    this.data.clearAll();
  }

  get ownerGroup(): FormGroup<OwnerForm> {
    return this.form.controls.owner;
  }
}