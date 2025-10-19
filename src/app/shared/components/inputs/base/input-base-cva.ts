import { Directive, Input, inject, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Directive()
export abstract class InputBaseCva<T> implements ControlValueAccessor {
    @Input() label = '';
    @Input() placeholder = '';
    @Input() disabled = false;

    protected _value: T | null = null;

    protected onChange: (val: T | null) => void = () => { };
    protected onTouched: () => void = () => { };
    protected cdr = inject(ChangeDetectorRef);

    get value(): T | null {
        return this._value;
    }
    set value(val: T | null) {
        if (this._value !== val) {
            this._value = val;
            this.onChange(val);
            this.cdr.markForCheck();
        }
    }

    writeValue(val: T | null): void {
        if (this._value !== val) {
            this._value = val;
            this.cdr.markForCheck();
        }
    }

    registerOnChange(fn: (val: T | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        if (this.disabled !== isDisabled) {
            this.disabled = isDisabled;
            this.cdr.markForCheck();
        }
    }

    protected emitChange(val: T | null) {
        if (this._value !== val) {
            this._value = val;
            this.onChange(val);
            this.cdr.markForCheck();
        }
    }

    handleBlur(): void {
        this.onTouched();
    }
}