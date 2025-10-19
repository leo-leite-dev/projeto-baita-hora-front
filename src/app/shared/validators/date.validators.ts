import { AbstractControl, ValidationErrors } from '@angular/forms';

function toDate(value: unknown): Date | null {
  if (value == null || value === '')
    return null;

  if (value instanceof Date) {

    if (isNaN(value.getTime()))
      return null;

    return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12, 0, 0, 0);
  }

  if (typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
  }

  if (typeof value === 'string') {
    const t = value.trim();
    if (!t)
      return null;

    const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) {
      const y = +iso[1], m = +iso[2] - 1, d = +iso[3];
      const dt = new Date(y, m, d, 12, 0, 0, 0);
      return isNaN(dt.getTime()) ? null : dt;
    }

    const br = t.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (br) {
      const d = +br[1], m = +br[2] - 1, y = +br[3];
      const dt = new Date(y, m, d, 12, 0, 0, 0);
      return isNaN(dt.getTime()) ? null : dt;
    }

    const dt = new Date(t);
    return isNaN(dt.getTime()) ? null : new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 12, 0, 0, 0);
  }

  return null;
}

export function dateValidator(control: AbstractControl): ValidationErrors | null {
  const d = toDate(control.value);
  return d || control.value == null || control.value === '' ? null : { dateInvalid: true };
}

export function adultOnlyValidator(control: AbstractControl): ValidationErrors | null {
  const d = toDate(control.value);
  if (!d)
    return null;

  const today = new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0, 0);
  const eighteen = new Date(d.getFullYear() + 18, d.getMonth(), d.getDate(), 12, 0, 0, 0);
  return eighteen <= todayMid ? null : { adultOnly: true };
}

export function minDate1900Validator(control: AbstractControl): ValidationErrors | null {
  const d = toDate(control.value);

  if (!d)
    return null;

  const min = new Date(1900, 0, 1, 12, 0, 0, 0);
  return d >= min ? null : { dateMin: '1900-01-01' };
}

export function maxDateTodayValidator(control: AbstractControl): ValidationErrors | null {
  const d = toDate(control.value);

  if (!d)
    return null;

  const today = new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0, 0);
  return d <= todayMid ? null : { dateMax: 'today' };
}