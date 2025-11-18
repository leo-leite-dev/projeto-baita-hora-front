import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AddressForm, AddressFormComponent } from '../address-form/address-form.component';
import { FormGenericModule } from '../../../../../shareds/common/FormGenericModule';

export type ProfileForm = {
  fullName: FormControl<string>;
  cpf: FormControl<string>;
  rg: FormControl<string | null>;
  phone: FormControl<string>;
  birthDate: FormControl<Date | null>;
  address: FormGroup<AddressForm>;
};

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [
    FormGenericModule,
    AddressFormComponent
  ],
  templateUrl: './profile-form.component.html',
  styleUrl: './profile-form.component.scss'
})
export class ProfileFormComponent {
  @Input({ required: true }) group!: FormGroup<ProfileForm>;
  @Input() locked = false;
  @Input() editableKeys: string[] = [];  

  readonly today = new Date();
  readonly minBirth = new Date(this.today.getFullYear() - 120, 0, 1);

  ngOnChanges(): void {
    if (!this.group) 
      return;

    if (!this.locked) {
      this.group.enable({ emitEvent: false });
      return;
    }

    this.group.disable({ emitEvent: false });
    this.editableKeys.forEach(k => this.group.get(k)?.enable({ emitEvent: false }));
  }
}