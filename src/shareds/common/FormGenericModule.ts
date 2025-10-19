import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldErrorsComponent } from '../../app/shared/components/field-errors/field-errors.component';
import { InputComponent } from '../../app/shared/components/inputs/input/input.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputComponent,
        FieldErrorsComponent,
    ],
    exports: [
        CommonModule,
        ReactiveFormsModule,
        InputComponent,
        FieldErrorsComponent,
    ],
})
export class FormGenericModule { }