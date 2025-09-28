import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { InputGenericModule } from '../../../../../shareds/common/InputGenericModule';

export type ServiceOfferingForm = {
  serviceOfferingName: FormControl<string>;
  price: FormControl<number>;
  currency: FormControl<string>;
};

@Component({
  selector: 'app-service-offering-form',
  imports: [InputGenericModule],
  templateUrl: './service-offering-form.component.html',
  styleUrl: './service-offering-form.component.scss'
})

export class ServiceOfferingFormComponent {
  @Input({ required: true }) group!: FormGroup<ServiceOfferingForm>;
}