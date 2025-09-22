import { AbstractControl, ValidationErrors } from '@angular/forms';

function parseDateFlexible(s: string): Date | null {
  const t = s.trim();
  if (!t) return null;

  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const d = new Date(`${iso[1]}-${iso[2]}-${iso[3]}T00:00:00`);
    return isNaN(d.getTime()) ? null : d;
  }

  const br = t.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) {
    const d = new Date(`${br[3]}-${br[2]}-${br[1]}T00:00:00`);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

export function dateValidator(control: AbstractControl): ValidationErrors | null {
  const raw = (control.value ?? '').toString();
  if (!raw) return null;
  return parseDateFlexible(raw) ? null : { dateInvalid: true };
}

export function adultOnlyValidator(control: AbstractControl): ValidationErrors | null {
  const raw = (control.value ?? '').toString();
  if (!raw) return null;

  const d = parseDateFlexible(raw);
  if (!d) return { dateInvalid: true };

  const now = new Date();
  const eighteen = new Date(d.getFullYear() + 18, d.getMonth(), d.getDate());
  return eighteen <= new Date(now.getFullYear(), now.getMonth(), now.getDate())
    ? null
    : { adultOnly: true };
}

export function minDate1900Validator(control: AbstractControl): ValidationErrors | null {
  const raw = (control.value ?? '').toString();
  if (!raw) return null;

  const d = parseDateFlexible(raw);
  if (!d) return { dateInvalid: true };

  const min = new Date(1900, 0, 1);
  return d >= min ? null : { dateMin: '1900-01-01' };
}

export function maxDateTodayValidator(control: AbstractControl): ValidationErrors | null {
  const raw = (control.value ?? '').toString();
  if (!raw) return null;

  const d = parseDateFlexible(raw);
  if (!d) return { dateInvalid: true };

  const today = new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return d <= todayMid ? null : { dateMax: 'today' };
}