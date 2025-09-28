import { Component, EventEmitter, Input, Output, forwardRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
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
  selector: 'app-auto-chips-auto-complete',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatOptionModule,
  ],
  templateUrl: './auto-chips-auto-complete.component.html',
  styleUrls: ['./auto-chips-auto-complete.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutoChipsAutocompleteComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutoChipsAutocompleteComponent<T extends SelectableItem> implements ControlValueAccessor, OnDestroy {

  private readonly _optionsBS = new BehaviorSubject<T[]>([]);
  private readonly destroy$ = new Subject<void>();

  @Input({ required: true, alias: 'options$' })
  set optionsStream(src: Observable<T[]> | null) {
    if (!src)
       return;
      
    src
      .pipe(takeUntil(this.destroy$))
      .subscribe((arr) => this._optionsBS.next(arr ?? []));
  }

  @Input()
  set options(value: T[] | Observable<T[]> | null) {
    if (!value)
       return;

    if (isObservable(value)) {
      (value as Observable<T[]>)
        .pipe(takeUntil(this.destroy$))
        .subscribe((arr) => this._optionsBS.next(arr ?? []));
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

  @Output() selectionChange = new EventEmitter<T[]>();

  readonly inputCtrl = new FormControl<string>('', { nonNullable: true });

  value: T[] = [];

  readonly filtered$: Observable<T[]> = combineLatest([
    this.inputCtrl.valueChanges.pipe(startWith(this.inputCtrl.value ?? '')),
    this._optionsBS.asObservable(),
  ]).pipe(
    map(([term, opts]) => this.filterOptions((term ?? '').toString(), opts))
  );

  private onChange: (val: T[]) => void = () => { };
  private onTouched: () => void = () => { };
  private touched = false;

  writeValue(obj: T[] | null): void {
    this.value = Array.isArray(obj) ? [...obj] : [];
    this.inputCtrl.setValue(this.inputCtrl.value ?? '');
  }

  registerOnChange(fn: (value: T[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
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

    this.value = [...this.value, item];
    this.emitChange();
    this.inputCtrl.setValue(''); 
    this.markTouched();
  }

  remove(item: T): void {
    const key = this.trackBy(item);
    this.value = this.value.filter((v) => this.trackBy(v) !== key);
    this.emitChange();
    this.inputCtrl.setValue(this.inputCtrl.value ?? '');
    this.markTouched();
  }

  isSelected(item: T): boolean {
    const key = this.trackBy(item);
    return this.value.some((v) => this.trackBy(v) === key);
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

    this.value = this.value.slice(0, -1);
    this.emitChange();
    this.inputCtrl.setValue(this.inputCtrl.value ?? '');
    this.markTouched();
  }

  chipTrackBy = (_: number, item: T) => this.trackBy(item);

  private emitChange(): void {
    this.onChange(this.value);
    this.selectionChange.emit(this.value);
  }

  private filterOptions(term: string, base: T[] = this._optionsBS.value): T[] {
    const q = term.toLowerCase().trim();
    const out = base.filter((opt) =>
      this.displayWith(opt).toLowerCase().includes(q)
    );
    return this.preventDuplicates ? out.filter((opt) => !this.isSelected(opt)) : out;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}