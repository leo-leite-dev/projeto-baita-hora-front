import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMatInputTelComponent } from 'ngx-mat-input-tel';

@Component({
  selector: 'app-input-phone',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgxMatInputTelComponent,
  ],
  templateUrl: './input-phone.component.html',
  styleUrls: ['./input-phone.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputPhoneComponent),
      multi: true,
    },
  ],
})
export class InputPhoneComponent implements ControlValueAccessor {
  @Input() label = 'Telefone';
  @Input() inputId = `input-phone-${Math.random().toString(36).substring(2, 9)}`;

  value = '';
  disabled = false;

  private onChange = (val: string) => { };
  private onTouched = () => { };

  writeValue(val: string): void {
    this.value = val ?? '';
  }
  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
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