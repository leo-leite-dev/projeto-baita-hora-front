import { Component, Input, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, shareReplay } from 'rxjs';
import { FormGenericModule } from '../../../../../shareds/common/FormGenericModule';
import { Autocomplete, SelectableItem, DisplayFn, TrackByFn } from '../../../../shared/components/inputs/auto-complete/auto-complete.component';
import { ServiceOfferingsService } from '../../../companies/service-offerings/services/service-offerings.service';
import { CustomersService } from '../../services/customer.service';
import { ServiceOfferingOption } from '../../../companies/service-offerings/models/service-oferring-options.model';
import { MatTooltipModule } from '@angular/material/tooltip';

export type AppointmentForm = {
  customer: FormControl<SelectableItem | null>;
  serviceOfferings: FormControl<ServiceOfferingOption[]>;
};

export interface CustomerSelectableItem extends SelectableItem {
  noShowCount: number;
  noShowPenaltyTotal: number

}

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    FormGenericModule,
    Autocomplete,
    MatTooltipModule
  ],
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss'],
})
export class AppointmentFormComponent {
  @Input({ required: true }) group!: FormGroup<AppointmentForm>;

  private readonly customersService = inject(CustomersService);
  private readonly serviceOfferingsService = inject(ServiceOfferingsService);

  readonly customerOptions$: Observable<CustomerSelectableItem[]> =
    this.customersService
      .listCustomerOptions('', 50)
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  readonly serviceOfferingOptions$: Observable<ServiceOfferingOption[]> =
    this.serviceOfferingsService
      .listServiceOfferingActiveOptionsForCurrentUser('', 50)
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  displayCustomerWith: DisplayFn<CustomerSelectableItem> = (c) =>
    c ? c.name : '';

  displayWith: DisplayFn<SelectableItem> = (c: SelectableItem | null) =>
    c ? c.name : '';

  trackBy: TrackByFn<SelectableItem> = (c: SelectableItem) => c.id;

  getFace(noShowCount?: number): string {
    if (!noShowCount || noShowCount === 0)
      return 'assets/icons/green-happy-face.svg';

    if (noShowCount === 1)
      return 'assets/icons/yellow-unhappy-face.svg';

    return 'assets/icons/red-angry-face.svg';
  }

  getPenaltyTooltip(c: CustomerSelectableItem): string {
    if (!c.noShowPenaltyTotal || c.noShowPenaltyTotal <= 0)
      return 'Sem pendências';

    const valor = c.noShowPenaltyTotal.toFixed(2).replace('.', ',');
    return `Multa de não comparecimento R$ ${valor}`;
  }
}