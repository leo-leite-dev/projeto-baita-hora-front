import { AbstractControl, ValidationErrors } from '@angular/forms';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+(\.com(\.br)?|\.br)$/i;

export function emailValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value ?? '').toString().trim();
    if (!value) return null;
    return EMAIL_REGEX.test(value) ? null : { email: true };
}