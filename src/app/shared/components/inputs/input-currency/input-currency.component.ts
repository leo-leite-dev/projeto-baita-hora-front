import { CommonModule } from '@angular/common';
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, OnChanges, SimpleChanges,
  ViewChild, ElementRef
} from '@angular/core';

@Component({
  selector: 'app-input-currency',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input-currency.component.html',
  styleUrls: ['./input-currency.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputCurrencyComponent implements OnChanges {
  @Input() id?: string;
  @Input() label = '';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() fractionDigits = 2;
  @Input() value: number = 0;

  @Output() valueChange = new EventEmitter<number>();
  @Output() blur = new EventEmitter<void>();

  @ViewChild('el', { static: false }) elRef?: ElementRef<HTMLInputElement>;

  private readonly inputId = 'cur-' + Math.random().toString(36).slice(2);
  get controlId(): string { return this.id || this.inputId; }

  text = '';
  private digits = '0';

  ngOnChanges(ch: SimpleChanges) {
    if (ch['value']) {
      this.digits = this.numberToDigits(this.value ?? 0);
      this.text = this.formatFromDigits(this.digits, this.fractionDigits).formatted;
    }
  }

  onFocus(inputEl: HTMLInputElement) {
    if (this.isZeroText(this.text)) setTimeout(() => inputEl.select());
  }

  onKeyDown(ev: KeyboardEvent) {
    if (this.disabled) return;
    const key = ev.key;
    const isDigit = /^[0-9]$/.test(key);
    const isBackspace = key === 'Backspace';
    const isDelete = key === 'Delete';
    const navKey = ['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key);
    if (navKey) return;
    if (isDigit || isBackspace || isDelete || key === ',' || key === '.') {
      ev.preventDefault();
      const el = this.elRef?.nativeElement;
      const selStart = el?.selectionStart ?? this.text.length;
      const selEnd = el?.selectionEnd ?? selStart;
      const selDigits = this.countDigits(this.text.slice(selStart, selEnd));

      if (isDigit) {
        this.digits = selDigits > 0 ? this.appendDigit('0', key) : this.appendDigit(this.digits, key);
      } else if (isBackspace || isDelete) {
        this.digits = selDigits > 0 ? '0' : this.popDigit(this.digits);
      }

      const { formatted, numeric } = this.formatFromDigits(this.digits, this.fractionDigits);
      this.text = formatted;
      this.valueChange.emit(numeric);
      setTimeout(() => this.moveCaretToEnd());
    }
  }

  onInput(ev: Event) {
    if (this.disabled) return;
    const raw = (ev.target as HTMLInputElement).value ?? '';
    const onlyDigits = this.extractDigits(raw) || '0';
    this.digits = this.stripLeadingZeros(onlyDigits) || '0';
    const { formatted, numeric } = this.formatFromDigits(this.digits, this.fractionDigits);
    this.text = formatted;
    this.valueChange.emit(numeric);
    setTimeout(() => this.moveCaretToEnd());
  }

  onBlur() {
    const { formatted } = this.formatFromDigits(this.digits, this.fractionDigits);
    this.text = formatted;
    this.blur.emit();
  }

  private moveCaretToEnd() {
    const el = this.elRef?.nativeElement;
    if (!el) return;
    const end = this.text.length;
    el.setSelectionRange(end, end);
  }

  private extractDigits(s: string): string {
    return (s ?? '').replace(/\D+/g, '');
  }

  private stripLeadingZeros(s: string): string {
    return s.replace(/^0+(?=\d)/, '');
  }

  private isZeroText(txt: string): boolean {
    return this.formatFromDigits('0', this.fractionDigits).formatted === (txt ?? '');
  }

  private numberToDigits(n: number): string {
    const factor = Math.pow(10, this.fractionDigits);
    const abs = Math.round(Math.abs(n) * factor);
    return String(abs);
  }

  private appendDigit(current: string, d: string): string {
    const safe = this.stripLeadingZeros(current) || '0';
    const next = (safe + d).replace(/^0+(?=\d)/, '');
    return next === '' ? '0' : next;
  }

  private popDigit(current: string): string {
    const safe = this.stripLeadingZeros(current) || '0';
    const next = safe.length > 1 ? safe.slice(0, -1) : '0';
    return next;
  }

  private countDigits(s: string): number {
    return (s.match(/\d/g) ?? []).length;
  }

  private formatFromDigits(digits: string, fractionDigits: number): { formatted: string; numeric: number } {
    const safe = (digits.replace(/\D/g, '') || '0');
    const minLen = fractionDigits + 1;
    const padded = safe.padStart(minLen, '0');
    const intRaw = padded.slice(0, padded.length - fractionDigits);
    const decRaw = padded.slice(-fractionDigits);
    const intWithThousands = intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const formatted = `R$ ${intWithThousands},${decRaw}`;
    const numeric = Number(`${intRaw}.${decRaw}`);
    return { formatted, numeric: Number.isFinite(numeric) ? numeric : 0 };
  }
}
