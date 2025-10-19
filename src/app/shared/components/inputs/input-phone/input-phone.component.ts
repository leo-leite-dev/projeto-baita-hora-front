import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-input-phone',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMaskDirective],
  templateUrl: './input-phone.component.html',
  styleUrls: ['./input-phone.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNgxMask()],
})
export class InputPhoneComponent implements OnChanges {
  @Input() id?: string;
  @Input() label = '';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() dropSpecialCharacters = true;
  @Input() mask: string = '(00) 00000-0000';
  @Input() value: string | null = null;

  @Output() valueChange = new EventEmitter<string | null>();
  @Output() blur = new EventEmitter<void>();

  private readonly inputId = 'ph-' + Math.random().toString(36).slice(2);
  get controlId(): string { return this.id || this.inputId; }

  model = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      this.model = this.value ?? '';
    }
  }

  get phoneMask(): string {
    const digits = (this.model || '').replace(/\D+/g, '');
    return digits.length > 10 ? '(00) 00000-0000' : '(00) 0000-0000';
  }

  onModelChange(v: string) {
    this.valueChange.emit(v === '' ? null : v);
  }

  onBlur() {
    this.blur.emit();
  }
}