import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UserForm, UserFormComponent } from '../../../../shared/components/forms/user-form/user-form.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-owner-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UserFormComponent
  ],
  templateUrl: './owner-form.component.html'
})
export class OwnerFormComponent {
  @Input({ required: true }) group!: FormGroup<UserForm>;
}