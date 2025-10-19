import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CompanyRole } from '../../../../shared/enums/company-role.enum';
import { SelectComponent, SelectOption } from '../../../../shared/components/select/select.component';
import { AutoChipsAutocompleteComponent } from '../../../../shared/components/inputs/auto-chips-auto-complete/auto-chips-auto-complete.component';
import { Observable } from 'rxjs';
import { InputGenericModule } from '../../../../../shareds/common/InputGenericModule';
import { ServiceOfferingOption } from '../../service-offerings/models/service-oferring-option.model';

export type PositionForm = {
  name: FormControl<string>;
  accessLevel: FormControl<CompanyRole>;
  serviceOfferings: FormControl<ServiceOfferingOption[]>;
};

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
  @Input({ required: true }) serviceOfferingOptions$!: Observable<ServiceOfferingOption[]>;

  @Input() roleOptions: SelectOption<CompanyRole>[] = [
    { value: CompanyRole.Staff, label: 'Equipe' },
    { value: CompanyRole.Viewer, label: 'Usuário' },
    { value: CompanyRole.Manager, label: 'Gerente' },
  ];

  @Input() soDisplay: (o: ServiceOfferingOption | null) => string = (o) => o?.name ?? '';
  @Input() soTrack: (o: ServiceOfferingOption) => string = (o) => o.id;
}