import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption<Value = string> {
  value: Value;
  label: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent<Value = string> implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder = 'Selecionar';
  @Input() options: SelectOption<Value>[] = [];
  @Input() invalid = false;

  value: Value | null = null;
  disabled = false;

  id = `sel-${Math.random().toString(36).slice(2, 9)}`;

  private onChange: (val: Value | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(obj: Value | null): void {
    this.value = (obj ?? null) as Value | null;
  }

  registerOnChange(fn: (val: Value | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const raw = target.value;
    const val = (raw === '' ? null : this.castValue(raw)) as Value | null;

    this.value = val;
    this.onChange(val);
  }

  onBlur(): void {
    this.onTouched();
  }

  private castValue(raw: string): any {
    const opt = this.options.find(o => String(o.value) === raw);
    return opt ? opt.value : raw;
  }

  trackByValue = (_: number, opt: SelectOption<Value>) => opt.value;
}