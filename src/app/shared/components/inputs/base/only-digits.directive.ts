import { Directive, HostListener } from '@angular/core';

@Directive({
    selector: '[onlyDigits]',
    standalone: true
})
export class OnlyDigitsDirective {
    @HostListener('keypress', ['$event'])
    onKeypress(e: KeyboardEvent) {
        const k = e.key;
        if (k < '0' || k > '9') e.preventDefault();
    }

    @HostListener('paste', ['$event'])
    onPaste(e: ClipboardEvent) {
        e.preventDefault();
        const text = e.clipboardData?.getData('text') ?? '';
        const target = e.target as HTMLInputElement;
        const digits = text.replace(/\D+/g, '');
        const start = target.selectionStart ?? target.value.length;
        const end = target.selectionEnd ?? target.value.length;
        const next = target.value.slice(0, start) + digits + target.value.slice(end);
        target.value = next;

        target.dispatchEvent(new Event('input', { bubbles: true }));
    }
}