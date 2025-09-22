import { AbstractControl, ValidationErrors } from '@angular/forms';

export function rgValidator(control: AbstractControl): ValidationErrors | null {
  const raw = (control.value ?? '').toString().trim();
  if (!raw) return null;

  const normalized = raw.replace(/[^0-9xX]+/g, '').toUpperCase();
  const len = normalized.length;

  const okLen = len >= 7 && len <= 12;
  const okChars = /^[0-9X]+$/.test(normalized);

  return okLen && okChars ? null : { rgInvalid: true };
}
