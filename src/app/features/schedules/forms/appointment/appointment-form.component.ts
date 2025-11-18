import { Component, Input, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, shareReplay } from 'rxjs';
import { FormGenericModule } from '../../../../../shareds/common/FormGenericModule';
import { Autocomplete, SelectableItem, DisplayFn, TrackByFn } from '../../../../shared/components/inputs/auto-complete/auto-complete.component';
import { ServiceOfferingsService } from '../../../companies/service-offerings/services/service-offerings.service';
import { CustomersService } from '../../services/customer.service';
import { ServiceOfferingOption } from '../../../companies/service-offerings/models/service-oferring-option.model';

export type AppointmentForm = {
  customer: FormControl<SelectableItem | null>;
  serviceOfferings: FormControl<ServiceOfferingOption[]>;
};

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [FormGenericModule, Autocomplete],
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss'],
})
export class AppointmentFormComponent {
  @Input({ required: true }) group!: FormGroup<AppointmentForm>;

  private readonly customersService = inject(CustomersService);
  private readonly serviceOfferingsService = inject(ServiceOfferingsService);

  readonly customerOptions$: Observable<SelectableItem[]> = this.customersService
    .listCustomerOptions('', 50)
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  readonly serviceOfferingOptions$: Observable<ServiceOfferingOption[]> =
    this.serviceOfferingsService
      .listServiceOfferingActiveOptionsForCurrentUser('', 50)
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  displayWith: DisplayFn<SelectableItem> = (c: SelectableItem | null) =>
    c ? c.name : '';

  trackBy: TrackByFn<SelectableItem> = (c: SelectableItem) => c.id;
}