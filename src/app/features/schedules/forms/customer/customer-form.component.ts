import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormGenericModule } from '../../../../../shareds/common/FormGenericModule';

export type CustomerForm = {
  customerName: FormControl<string>;
  customerCpf: FormControl<string>;
  customerPhone: FormControl<string>;
};

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [FormGenericModule],
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.scss'],
})
export class CustomerFormComponent {
  @Input({ required: true }) group!: FormGroup<CustomerForm>;
}
