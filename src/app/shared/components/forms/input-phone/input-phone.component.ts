import { Component, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxMatInputTelComponent } from 'ngx-mat-input-tel';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input-phone',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxMatInputTelComponent
  ],
  templateUrl: './input-phone.component.html',
  styleUrls: ['./input-phone.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputPhoneComponent),
      multi: true
    }
  ]
})
export class InputPhoneComponent implements ControlValueAccessor {
  @Input() label = 'Telefone';
  @Input() inputId = `input-phone-${Math.random().toString(36).substring(2, 9)}`;

  value: string = '';
  disabled = false;

  private onChange = (val: string) => { };
  private onTouched = () => { };

  writeValue(val: string): void {
    this.value = val || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleChange(value: string) {
    this.value = value;
    this.onChange(value);
  }

  handleBlur() {
    this.onTouched();
  }
}