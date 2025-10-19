import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-input-text',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputTextComponent {
  @Input() type: 'text' | 'password' | 'email' = 'text';
  @Input() id?: string;
  @Input() label = '';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() value: string | null = null;

  @Output() valueChange = new EventEmitter<string | null>();
  @Output() blur = new EventEmitter<void>();

  private readonly inputId = 'in-' + Math.random().toString(36).slice(2);
  get controlId(): string { return this.id || this.inputId; }

  onInput(ev: Event) {
    const next = (ev.target as HTMLInputElement).value;
    this.valueChange.emit(next);
  }

  onBlur() {
    this.blur.emit();
  }
}