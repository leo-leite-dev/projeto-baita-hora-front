import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFromUtc',
  standalone: true,
  pure: true
})
export class TimeFromUtcPipe implements PipeTransform {
  transform(isoUtc?: string, withSeconds = false): string {
    if (!isoUtc || typeof isoUtc !== 'string') return '--';
    const dt = new Date(isoUtc); 
    if (Number.isNaN(dt.getTime())) return '--';

    return dt.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: withSeconds ? '2-digit' : undefined
    });
  }
}