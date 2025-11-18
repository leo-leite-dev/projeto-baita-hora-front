import { Component, Input, forwardRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule, } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { BehaviorSubject, Observable, Subject, combineLatest, isObservable } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';

export interface SelectableItem {
  id: string | number;
  name: string;
}

export type DisplayFn<T> = (value: T | null) => string;
export type TrackByFn<T> = (value: T) => string | number;

@Component({
  selector: 'app-auto-complete',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatOptionModule,
  ],
  templateUrl: './auto-complete.component.html',
  styleUrls: ['./auto-complete.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Autocomplete),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Autocomplete<T extends SelectableItem>
  implements ControlValueAccessor, OnDestroy {

  private readonly _optionsBS = new BehaviorSubject<T[]>([]);
  private readonly destroy$ = new Subject<void>();

  @Input({ required: true, alias: 'options$' })
  set optionsStream(src: Observable<T[]> | null) {
    if (!src) return;
    src.pipe(takeUntil(this.destroy$)).subscribe(arr => this._optionsBS.next(arr ?? []));
  }

  @Input()
  set options(value: T[] | Observable<T[]> | null) {
    if (!value)
      return;

    if (isObservable(value)) {
      (value as Observable<T[]>)
        .pipe(takeUntil(this.destroy$))
        .subscribe(arr => this._optionsBS.next(arr ?? []));
    } else {
      this._optionsBS.next(value ?? []);
    }
  }

  @Input() displayWith: DisplayFn<T> = (v) => (v ? v.name : '');
  @Input() trackBy: TrackByFn<T> = (v) => v.id;
  @Input() placeholder = '';
  @Input() inputPlaceholder = '';
  @Input() preventDuplicates = true;
  @Input() disabled = false;
  @Input() multiple = true;
  @Input() showChips = true;
  @Input() readonlySelectedText = true;
  @Input() showClearButton = true; 

  readonly inputCtrl = new FormControl<string>('', { nonNullable: true });
  value: T[] = [];

  readonly filtered$: Observable<T[]> = combineLatest([
    this.inputCtrl.valueChanges.pipe(startWith(this.inputCtrl.value ?? '')),
    this._optionsBS.asObservable(),
  ]).pipe(
    map(([term, opts]) => this.filterOptions((term ?? '').toString(), opts)),
  );

  private onChange: (val: any) => void = () => { };
  private onTouched: () => void = () => { };
  private touched = false;

  writeValue(obj: T[] | T | null): void {
    if (this.multiple)
      this.value = Array.isArray(obj) ? [...obj] : (obj ? [obj] : []);
    else
      this.value = Array.isArray(obj) ? (obj[0] ? [obj[0]] : []) : (obj ? [obj] : []);

    if (!this.multiple && this.readonlySelectedText) {
      const text = this.value[0] ? this.displayWith(this.value[0]) : '';
      this.inputCtrl.setValue(text, { emitEvent: text === '' });
    } else {
      const cur = this.inputCtrl.value ?? '';
      this.inputCtrl.setValue(cur, { emitEvent: true });
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled)
      this.inputCtrl.disable({ emitEvent: false });
    else
      this.inputCtrl.enable({ emitEvent: false });
  }

  markTouched(): void {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  select(ev: MatAutocompleteSelectedEvent): void {
    const item = ev.option.value as T;

    if (this.preventDuplicates && this.isSelected(item)) {
      this.inputCtrl.setValue('');
      return;
    }

    if (this.multiple) {
      this.value = [...this.value, item];
      this.inputCtrl.setValue('');
    } else {
      this.value = [item];

      if (this.readonlySelectedText) {
        this.inputCtrl.setValue(this.displayWith(item), { emitEvent: false });
      } else {
        this.inputCtrl.setValue('', { emitEvent: false });
      }
    }

    this.emitChange();
    this.markTouched();
  }

  remove(item: T): void {
    const key = this.trackBy(item);
    this.value = this.value.filter(v => this.trackBy(v) !== key);
    this.emitChange();
    this.inputCtrl.setValue(this.inputCtrl.value ?? '');
    this.markTouched();
  }

  clear(): void {
    this.value = [];
    this.emitChange();
    this.inputCtrl.setValue('', { emitEvent: true });
  }

  isSelected(item: T): boolean {
    const key = this.trackBy(item);
    return this.value.some(v => this.trackBy(v) === key);
  }

  handleBackspace(event: Event): void {
    const e = event as KeyboardEvent;
    if (e.key !== 'Backspace')
      return;

    const el = e.target as HTMLInputElement | null;
    if (el?.value?.length)
      return;

    if (this.value.length === 0)
      return;

    if (this.multiple) {
      this.value = this.value.slice(0, -1);
      this.emitChange();
      this.inputCtrl.setValue(this.inputCtrl.value ?? '');
      this.markTouched();
    } else {
      this.clear();
    }
  }

  chipTrackBy = (_: number, item: T) => this.trackBy(item);

  private emitChange(): void {
    const out = this.multiple ? this.value : (this.value[0] ?? null);
    this.onChange(out);
  }

  private filterOptions(term: string, base: T[] = this._optionsBS.value): T[] {
    const q = term.toLowerCase().trim();
    const out = base.filter(opt =>
      (this.displayWith(opt) || '').toLowerCase().includes(q),
    );

    return this.preventDuplicates && this.multiple
      ? out.filter(opt => !this.isSelected(opt))
      : out;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}