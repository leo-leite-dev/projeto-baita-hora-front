import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ProfileForm, ProfileFormComponent } from '../profile-form/profile-form.component';
import { FormGenericModule } from '../../../../../shareds/common/FormGenericModule';

export type AccountForm = {
  email: FormControl<string>;
  username: FormControl<string>;
  rawPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
  profile: FormGroup<ProfileForm>;
};

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [
    FormGenericModule,
    ProfileFormComponent
  ],
  templateUrl: './account-form.component.html',
  styleUrl: './account-form.component.scss'
})
export class AccountFormComponent {
  @Input({ required: true }) group!: FormGroup<AccountForm>;
  @Input() locked = false;
  @Input() editableKeys: string[] = [];
}