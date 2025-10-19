import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, forwardRef, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputTextComponent } from '../input-text/input-text.component';
import { InputNumberComponent } from '../input-number/input-number.component';
import { InputPhoneComponent } from '../input-phone/input-phone.component';
import { InputCurrencyComponent } from '../input-currency/input-currency.component';
import { InputMaskedComponent } from '../input-masked/input-masked.component';
import { InputDateComponent } from '../input-date/input-date.component';

type InputKind =
  | 'text' | 'password' | 'email' | 'date'
  | 'number' | 'phone' | 'currency'
  | 'masked';

type InputValueMap = {
  text: string | null;
  password: string | null;
  email: string | null;
  number: number | null;
  phone: string | null;
  currency: number | null;
  masked: string | null;
  date: Date | null;
};

type InputValue = InputValueMap[InputKind];

let _autoIdSeq = 0;

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    CommonModule,
    InputTextComponent,
    InputNumberComponent,
    InputPhoneComponent,
    InputCurrencyComponent,
    InputMaskedComponent,
    InputDateComponent,
  ],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InputComponent),
    multi: true,
  }],
})
export class InputComponent implements ControlValueAccessor {
  @Input() type: InputKind = 'text';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() fractionDigits = 2;
  @Input() dropSpecialCharacters = true;
  @Input() mask?: string;
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() startView: 'month' | 'year' | 'multi-year' = 'month';

  @Input() id = `app-input-${++_autoIdSeq}`;

  @Output() blur = new EventEmitter<void>();

  _value: InputValue = null;

  private onChange: (val: InputValue) => void = () => { };
  private onTouched: () => void = () => { };
  private cdr = inject(ChangeDetectorRef);

  get valueText(): string | null {
    return (typeof this._value === 'string' || this._value === null)
      ? this._value
      : (this._value instanceof Date ? null : this._value?.toString?.() ?? null);
  }

  get valueNumber(): number {
    return (typeof this._value === 'number') ? this._value : 0;
  }

  get valueDate(): Date | null {
    return (this._value instanceof Date) ? this._value : null;
  }

  get inputType(): 'text' | 'password' | 'email' {
    return this.type === 'password' || this.type === 'email' ? this.type : 'text';
  }

  writeValue(val: InputValue): void {
    this._value = val;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (val: InputValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  handleValueChange(val: InputValue) {
    this._value = val;
    this.onChange(val);
    this.cdr.markForCheck();
  }

  markTouched() {
    this.onTouched();
    this.blur.emit();
  }
}