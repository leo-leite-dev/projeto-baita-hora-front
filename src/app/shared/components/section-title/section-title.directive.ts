import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: 'h2[appSectionTitle]',
  standalone: true
})
export class SectionTitleDirective {
  @Input() appSectionTitle = '';

  @HostBinding('class')
  get hostClass() {
    return 'section-title';
  }
}