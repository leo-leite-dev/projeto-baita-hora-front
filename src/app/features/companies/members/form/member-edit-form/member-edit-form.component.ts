import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormGenericModule } from '../../../../../../shareds/common/FormGenericModule';

export type MemberEditForm = {
  email: FormControl<string>;
  cpf: FormControl<string>;
  rg: FormControl<string | null>;
};

@Component({
  selector: 'app-member-edit-form',
  standalone: true,
  imports: [FormGenericModule],
  templateUrl: './member-edit-form.component.html',
  styleUrls: ['./member-edit-form.component.scss'],
})
export class MemberEditFormComponent {
  @Input({ required: true }) group!: FormGroup<MemberEditForm>;
}