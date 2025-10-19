import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, map, of, startWith } from 'rxjs';
import { PositionOptions } from '../../../positions/models/position-options.mode';
import { UserForm, UserFormComponent } from '../../../../../shared/components/forms/user-form/user-form.component';
import { SelectComponent, SelectOption } from '../../../../../shared/components/select/select.component';
import { FormGenericModule } from '../../../../../../shareds/common/FormGenericModule';

export type MemberCreateForm = {
  positionId: FormControl<string>;
  Member: FormGroup<UserForm>;
};

@Component({
  selector: 'app-member-create-form',
  standalone: true,
  imports: [
    FormGenericModule,
    UserFormComponent,
    SelectComponent
  ],
  templateUrl: './member-create-form.component.html',
  styleUrls: ['./member-create-form.component.scss'],
})
export class MemberCreateFormComponent {
  @Input({ required: true }) group!: FormGroup<MemberCreateForm>;

  @Input({ required: true })
  set positionOptions$(src: Observable<PositionOptions[]>) {
    const safe$ = src ?? of<PositionOptions[]>([]);
    this.selectOptions$ = safe$.pipe(
      map(list =>
        (list ?? [])
          .filter(p => p.name?.toLowerCase() !== 'fundador')
          .map(p => ({
            value: String(p.id),
            label: String(p.name),
          }))
      ),
      startWith([])
    );
  }

  selectOptions$: Observable<SelectOption[]> = of([]);
}