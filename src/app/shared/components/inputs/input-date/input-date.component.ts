import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule, MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';

@Component({
  selector: 'app-input-date',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatIconModule,
    MatNativeDateModule,
  ],
  templateUrl: './input-date.component.html',
  styleUrls: ['./input-date.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
  ],
})
export class InputDateComponent implements OnChanges {
  @Input() id?: string;
  @Input() label = '';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() minYear = 1900;
  @Input() maxYear = new Date().getFullYear();
  @Input() startView: 'month' | 'year' | 'multi-year' = 'month';
  @Input() openOnFocus = false;
  @Input() value: Date | null = null;

  @Output() valueChange = new EventEmitter<Date | null>();
  @Output() blur = new EventEmitter<void>();

  model: Date | null = null;

  private readonly autoId = 'date-' + Math.random().toString(36).slice(2);
  get controlId(): string { return this.id ?? this.autoId; }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'])
      this.model = this.value ?? null;
  }

  get effectiveMinDate(): Date {
    return this.minDate ?? new Date(this.minYear, 0, 1);
  }
  get effectiveMaxDate(): Date {
    return this.maxDate ?? new Date(this.maxYear, 11, 31);
  }

  allowedDate = (d: Date | null): boolean =>
    !!d &&
    d.getTime() >= this.effectiveMinDate.getTime() &&
    d.getTime() <= this.effectiveMaxDate.getTime();

  onDateChange(ev: MatDatepickerInputEvent<Date>) {
    const dt = ev.value ?? null;
    if (dt && !this.allowedDate(dt)) {
      this.model = null;
      this.valueChange.emit(null);
      return;
    }
    this.model = dt;
    this.valueChange.emit(dt);
  }

  onBlur() { this.blur.emit(); }
  onClosed() { this.blur.emit(); }

  blockKeys(e: KeyboardEvent) {
    const allowed = ['Tab', 'Shift', 'F6'];
    if (!allowed.includes(e.key)) e.preventDefault();
  }
  prevent(e: Event) { e.preventDefault(); }

  openPicker(picker: MatDatepicker<Date>) {
    if (!this.disabled) picker.open();
  }
}
