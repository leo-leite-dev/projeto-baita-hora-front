import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'intlPhone',
  standalone: true,
})
export class IntlPhonePipe implements PipeTransform {
  transform(value?: string | null): { flag: string; formatted: string } {
    if (!value) 
      return { flag: '', formatted: '' };

    const digits = value.replace(/\D/g, '');

    if (digits.startsWith('55')) {
      const national = digits.slice(2); 

      if (national.length >= 6) {
        const ddd = national.slice(0, 2);
        const rest = national.slice(2);

        const part1 = rest.slice(0, rest.length - 4);
        const part2 = rest.slice(rest.length - 4);

        return {
          flag: '🇧🇷',
          formatted: `(${ddd}) ${part1}-${part2}`,
        };
      }

      return {
        flag: '🇧🇷',
        formatted: national,
      };
    }

    if (digits.startsWith('1')) {
      const n = digits.slice(1);
      if (n.length === 10) {
        return {
          flag: '🇺🇸',
          formatted: `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`,
        };
      }
    }

    return {
      flag: '🌍',
      formatted: `+${digits}`,
    };
  }
}