import { AbstractControl, ValidationErrors } from '@angular/forms';
import { cpf } from 'cpf-cnpj-validator';

export function cpfValidator(control: AbstractControl): ValidationErrors | null {
  const raw = (control.value ?? '').toString();
  if (!raw) return null;

  const digits = raw.replace(/\D+/g, '');
  if (digits.length !== 11) return { cpfLength: true };
  return cpf.isValid(digits) ? null : { cpfInvalid: true };
}