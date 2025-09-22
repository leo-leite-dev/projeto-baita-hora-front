import { AbstractControl, ValidationErrors } from '@angular/forms';

export function cepValidator(control: AbstractControl): ValidationErrors | null {
    const raw = (control.value ?? '').toString();
    if (!raw) return null;

    const digits = raw.replace(/\D+/g, '');
    return digits.length === 8 ? null : { cepInvalid: true };
}