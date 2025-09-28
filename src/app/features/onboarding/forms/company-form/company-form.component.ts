import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextComponent } from '../../../../shared/components/forms/input-text/input-text.component';
import { AddressForm, AddressFormComponent } from '../address-form/address-form.component';
import { FieldErrorsComponent } from '../../../../shared/components/field-errors/field-errors.component';
import { InputPhoneComponent } from '../../../../shared/components/forms/input-phone/input-phone.component';

export type CompanyForm = {
  companyName: FormControl<string>;
  tradeName: FormControl<string | null>;
  cnpj: FormControl<string>;
  companyPhone: FormControl<string>;
  companyEmail: FormControl<string>;
  address: FormGroup<AddressForm>;
};

@Component({
  selector: 'app-company-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextComponent,
    InputPhoneComponent,
    AddressFormComponent,
    FieldErrorsComponent
  ],
  templateUrl: './company-form.component.html'
})
export class CompanyFormComponent {
  @Input({ required: true }) group!: FormGroup<CompanyForm>;
}