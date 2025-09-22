import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextComponent } from '../../../../shared/components/forms/input-text/input-text.component';
import { AddressFormComponent, AddressForm } from '../address-form/address-form.component'; // reusa o tipo!
import { FieldErrorsComponent } from '../../../../shared/components/field-errors/field-errors.component';
import { InputPhoneComponent } from '../../../../shared/components/forms/input-phone/input-phone.component';

export type ProfileForm = {
  fullName: FormControl<string>;
  cpf: FormControl<string>;
  rg: FormControl<string>;
  userPhone: FormControl<string>;
  birthDate: FormControl<string>;
  address: FormGroup<AddressForm>;
};

export type OwnerForm = {
  userEmail: FormControl<string>;
  username: FormControl<string>;
  rawPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
  profile: FormGroup<ProfileForm>;
};

@Component({
  selector: 'app-owner-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextComponent,
    InputPhoneComponent,
    AddressFormComponent,
    FieldErrorsComponent
  ],
  templateUrl: './owner-form.component.html'
})
export class OwnerFormComponent {
  @Input({ required: true }) group!: FormGroup<OwnerForm>;
}