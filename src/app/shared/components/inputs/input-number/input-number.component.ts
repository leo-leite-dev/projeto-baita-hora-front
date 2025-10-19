import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { OnlyDigitsDirective } from '../base/only-digits.directive';

@Component({
  selector: 'app-input-number',
  standalone: true,
  imports: [CommonModule, OnlyDigitsDirective],
  templateUrl: './input-number.component.html',
  styleUrls: ['./input-number.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputNumberComponent {
  @Input() id?: string;
  @Input() label = '';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() value: number | null = null;

  @Output() valueChange = new EventEmitter<number | null>();
  @Output() blur = new EventEmitter<void>();

  private readonly inputId = 'num-' + Math.random().toString(36).slice(2);
  get controlId(): string { return this.id || this.inputId; }

  onInput(raw: string) {
    const digits = (raw ?? '').toString().replace(/\D+/g, '');
    const next = digits === '' ? null : Number(digits);
    this.valueChange.emit(next);
  }

  onBlur() {
    this.blur.emit();
  }
}