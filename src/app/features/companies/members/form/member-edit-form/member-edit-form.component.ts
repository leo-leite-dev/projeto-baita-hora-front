import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormGenericModule } from '../../../../../../shareds/common/FormGenericModule';
import { UserFormComponent } from '../../../../../shared/components/forms/user-form/user-form.component';

export type MemberEditForm = {
  email: FormControl<string>;
  cpf: FormControl<string>;
  rg: FormControl<string | null>;
};

@Component({
  selector: 'app-member-edit-form',
  standalone: true,
  imports: [
    FormGenericModule,
    UserFormComponent
  ],
  templateUrl: './member-edit-form.component.html',
  styleUrls: ['./member-edit-form.component.scss'],
})
export class MemberEditFormComponent {
  @Input({ required: true }) group!: FormGroup<MemberEditForm>;
}