import { Component, Input, forwardRef, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-input-text',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxMaskDirective
  ],
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTextComponent),
      multi: true
    }
  ]
})
export class InputTextComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'password' | 'email' | 'date' = 'text';
  @Input() disabled = false;
  @Input() mask?: string | null = null;
  @Input() currency = false;

  @Input() dropSpecialCharacters = false;
  @Output() blurred = new EventEmitter<void>();

  readonly inputId = 'input-' + Math.random().toString(36).slice(2);

  @ViewChild('inputEl', { static: true }) inputEl!: ElementRef<HTMLInputElement>;

  value: any = '';

  onChange: (val: any) => void = () => { };
  onTouched: () => void = () => { };

  constructor(private cdr: ChangeDetectorRef) { }

  writeValue(val: any): void {
    this.value = val ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  handleInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value = next;
    this.onChange(next);
  }

  handleBlur(): void {
    this.onTouched();
    this.blurred.emit();
  }
}