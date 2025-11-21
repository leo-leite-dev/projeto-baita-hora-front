import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FaIconComponent } from '../icons/fa-icon.component';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent implements ControlValueAccessor {
  @Input() label = 'Data';

  @Input() set value(v: string | null) {
    this._value = v ?? '';
    this.onChange(this._value || null);
  }

  get value(): string | null {
    return this._value || null;
  }


  @Input() min?: string;
  @Input() max?: string;
  @Input() disabled = false;
  @Input() clearable = true;

  @Output() valueChange = new EventEmitter<string | null>();
  @Output() cleared = new EventEmitter<void>();

  _value = '';

  private onChange: (val: string | null) => void = () => { };
  private onTouched: () => void = () => { };

  writeValue(val: string | null): void {
    this._value = val ?? '';
  }

  registerOnChange(fn: (val: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleInput(raw: string) {
    this._value = raw;
    const out = raw || null;
    this.onChange(out);
    this.valueChange.emit(out);
  }

  handleBlur() {
    this.onTouched();
  }

  openPicker(input: HTMLInputElement) {
    if (this.disabled) 
      return;

    const withPicker = input as HTMLInputElement & {
      showPicker?: () => void;
    };

    if (typeof withPicker.showPicker === 'function') {
      withPicker.showPicker();
    } else {
      input.focus();
      input.click();
    }
  }
}