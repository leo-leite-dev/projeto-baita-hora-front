import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AccountForm, AccountFormComponent } from '../../../../shared/components/forms/account-form/account-form.component';

@Component({
  selector: 'app-owner-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AccountFormComponent
  ],
  templateUrl: './owner-form.component.html'
})
export class OwnerFormComponent {
  @Input({ required: true }) group!: FormGroup<AccountForm>;
}