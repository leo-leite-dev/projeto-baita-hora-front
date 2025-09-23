import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'dateLabel',
    standalone: true,
    pure: true
})
export class DateLabelPipe implements PipeTransform {
    transform(ymd?: string): string {
        if (!ymd || typeof ymd !== 'string') return '--';

        const parts = ymd.split('-').map(Number);
        if (parts.length !== 3 || parts.some(n => Number.isNaN(n))) return '--';

        const [y, m, d] = parts;
        const dt = new Date(y, m - 1, d);
        if (Number.isNaN(dt.getTime())) return '--';

        return dt.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long'
        });
    }
}