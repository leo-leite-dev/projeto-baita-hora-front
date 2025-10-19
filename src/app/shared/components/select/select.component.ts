import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export type SelectScalar = string | number;

export interface SelectOption<T extends SelectScalar = string | number> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
export class SelectComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder = 'Selecionar';
  @Input() invalid = false;

  private _options: SelectOption[] = [];
  @Input() set options(val: SelectOption[]) {
    this._options = Array.isArray(val) ? val : [];
    this.syncStringValue();
  }
  get options(): SelectOption[] {
    return this._options;
  }

  private value: SelectScalar | null = null;

  stringValue = '';
  disabled = false;
  id = `sel-${Math.random().toString(36).slice(2, 9)}`;

  private onChange: (val: SelectScalar | null) => void = () => { };
  private onTouched: () => void = () => { };

  writeValue(obj: SelectScalar | null): void {
    this.value = obj ?? null;
    this.syncStringValue();
  }

  registerOnChange(fn: (val: SelectScalar | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleChange(raw: string): void {
    if (raw === '') {
      this.value = null;
      this.stringValue = '';
      this.onChange(null);
      return;
    }

    const selected = this.options.find(
      (o) => this.stringify(o.value) === raw
    )?.value ?? null;

    this.value = selected as SelectScalar | null;
    this.stringValue = raw;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  trackByValue = (_: number, opt: SelectOption) => this.stringify(opt.value);

  stringify(v: SelectScalar | null): string {
    return v !== null && v !== undefined ? String(v) : '';
  }

  private syncStringValue(): void {
    const v = this.stringify(this.value);
    const match = this.options.find((o) => this.stringify(o.value) === v);
    this.stringValue = match ? this.stringify(match.value) : '';
  }
}