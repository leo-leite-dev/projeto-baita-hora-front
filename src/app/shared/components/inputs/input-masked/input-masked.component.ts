import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-input-masked',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMaskDirective],
  templateUrl: './input-masked.component.html',
  styleUrls: ['./input-masked.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNgxMask()],
})
export class InputMaskedComponent implements OnChanges {
  @Input() id?: string;
  @Input() label = '';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input({ required: true }) mask!: string;
  @Input() dropSpecialCharacters = true;
  @Input() value: string | null = null;

  @Output() valueChange = new EventEmitter<string | null>();
  @Output() blur = new EventEmitter<void>();

  private readonly inputId = 'msk-' + Math.random().toString(36).slice(2);
  get controlId(): string { return this.id || this.inputId; }

  model: string = '';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value']) 
      this.model = this.value ?? '';
  }

  onModelChange(v: string) {
    this.valueChange.emit(v === '' ? null : v);
  }

  onBlur() {
    this.blur.emit();
  }
}