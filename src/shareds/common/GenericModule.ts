import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BackButtonComponent } from '../../app/shared/components/buttons/back-button/back-button.component';
import { ButtonComponent } from '../../app/shared/components/buttons/button/button.component';
import { FormHeaderComponent } from '../../app/shared/components/forms/form-header/form-header.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    BackButtonComponent,
    FormHeaderComponent,
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    BackButtonComponent,
    FormHeaderComponent,
  ],
})
export class GenericModule { }