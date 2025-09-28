import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextComponent } from '../../app/shared/components/forms/input-text/input-text.component';
import { FieldErrorsComponent } from '../../app/shared/components/field-errors/field-errors.component';
import { InputNumberComponent } from '../../app/shared/components/forms/input-number/input-number.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberComponent,
    FieldErrorsComponent,
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputNumberComponent,
    FieldErrorsComponent
  ],
})
export class InputGenericModule { }