import { AbstractControl, ValidationErrors } from '@angular/forms';
import { cnpj } from 'cpf-cnpj-validator';

export function cnpjValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) 
        return null;

    return cnpj.isValid(value) ? null : { cnpjInvalid: true };
}