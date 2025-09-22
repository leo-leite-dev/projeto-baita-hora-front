import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordStrength = (minLen = 8): ValidatorFn => {
    const U = /[A-Z]/;
    const L = /[a-z]/;
    const D = /\d/;
    const S = /[^A-Za-z0-9]/;

    return (control: AbstractControl): ValidationErrors | null => {
        const v = (control.value ?? '').toString();

        if (!v) return null;

        const hasMinLen = v.length >= minLen;
        const hasUpper = U.test(v);
        const hasLower = L.test(v);
        const hasDigit = D.test(v);
        const hasSpecial = S.test(v);

        const ok = hasMinLen && hasUpper && hasLower && hasDigit && hasSpecial;
        if (ok) return null;

        return {
            passwordStrength: {
                minLen,
                hasMinLen,
                hasUpper,
                hasLower,
                hasDigit,
                hasSpecial,
            }
        };
    };
};

export const mustMatch = (a: string, b: string): ValidatorFn => {
    return (group: AbstractControl): ValidationErrors | null => {
        const c1 = group.get(a);
        const c2 = group.get(b);
        if (!c1 || !c2) return null;

        const match = c1.value === c2.value;
        if (!match) {
            c2.setErrors({ ...(c2.errors ?? {}), mustMatch: true });
        } else if (c2.errors) {
            const { mustMatch, ...rest } = c2.errors;
            c2.setErrors(Object.keys(rest).length ? rest : null);
        }
        return null;
    };
};