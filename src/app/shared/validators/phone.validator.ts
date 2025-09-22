import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const phoneMobileE164Validator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const raw = String(control.value ?? '').trim();
  if (!raw) return null;

  try {
    // assume BR se o usuário digitar sem +55
    const pn = parsePhoneNumberFromString(raw, 'BR');
    if (!pn || !pn.isValid()) return { e164: true };

    // Regras para BR: DDD (2) + 9 + 8 dígitos = 11 dígitos
    if (pn.country === 'BR') {
      const nsn = pn.nationalNumber; // ex.: '51981124522'
      if (nsn.length !== 11 || nsn[2] !== '9') return { brMobile: true };
      return null; // válido
    }

    // Fora do BR: só valide como mobile se conseguirmos identificar o tipo
    const t = typeof pn.getType === 'function' ? pn.getType() : undefined;
    if (t && t !== 'MOBILE' && t !== 'FIXED_LINE_OR_MOBILE') return { notMobile: true };

    return null;
  } catch {
    return { e164: true };
  }
};
