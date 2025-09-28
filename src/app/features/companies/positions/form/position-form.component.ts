import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CompanyRole } from '../../../../shared/enums/company-role.enum';
import { InputGenericModule } from '../../../../../shareds/common/InputGenericModule';
import { SelectComponent } from '../../../../shared/components/forms/select/select.component';
import { AutoChipsAutocompleteComponent } from '../../../../shared/components/forms/auto-chips-auto-complete/auto-chips-auto-complete.component';
import { ServiceDto } from '../models/position.model';
import { Observable } from 'rxjs';

export type PositionForm = {
  positionName: FormControl<string>;
  accessLevel: FormControl<CompanyRole>;
  serviceOfferings: FormControl<ServiceDto[]>;
};

export type SelectOption<T = string | number> = { value: T; label: string };

@Component({
  selector: 'app-position-form',
  standalone: true,
  imports: [
    InputGenericModule,
    SelectComponent,
    AutoChipsAutocompleteComponent,
  ],
  templateUrl: './position-form.component.html',
  styleUrls: ['./position-form.component.scss']
})
export class PositionFormComponent {
  @Input({ required: true }) group!: FormGroup<PositionForm>;
  @Input({ required: true }) serviceOfferingOptions$!: Observable<ServiceDto[]>;

  roleOptions: SelectOption<CompanyRole>[] = [
    { value: CompanyRole.Manager, label: 'Gerente' },
    { value: CompanyRole.Staff, label: 'Equipe' },
    { value: CompanyRole.Viewer, label: 'Usuário' },
  ];

  soDisplay = (o: ServiceDto | null) => o?.name ?? '';
  soTrack = (o: ServiceDto) => o.id;
}