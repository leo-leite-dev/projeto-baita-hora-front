import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconProp, IconPrefix } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'app-fa-icon',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './fa-icon.component.html',
  styleUrls: ['./fa-icon.component.scss']
})
export class FaIconComponent {
  @Input() icon: IconProp = 'times';
  @Input() prefix: IconPrefix = 'fas';
  @Input() className = '';
  @Input() spin = false;
  @Input() size?: 'xs' | 'lg' | 'sm' | '1x' | '2x' | '3x' | '4x' | '5x' | '6x' | '7x' | '8x' | '9x' | '10x';

  get resolvedIcon(): IconProp {
    return typeof this.icon === 'string'
      ? [this.prefix, this.icon] as IconProp
      : this.icon;
  }
}
