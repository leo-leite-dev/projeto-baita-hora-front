import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AddressForm, AddressFormComponent } from '../../../../shared/components/forms/address-form/address-form.component';
import { FieldErrorsComponent } from '../../../../shared/components/field-errors/field-errors.component';
import { InputComponent } from '../../../../shared/components/inputs/input/input.component';

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
    InputComponent,
    AddressFormComponent,
    FieldErrorsComponent
  ],
  templateUrl: './company-form.component.html'
})
export class CompanyFormComponent {
  @Input({ required: true }) group!: FormGroup<CompanyForm>;
}