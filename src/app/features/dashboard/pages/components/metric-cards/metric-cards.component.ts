import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FaIconComponent } from '../../../../../shared/components/icons/fa-icon.component';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

export type MetricItem = {
  icon?: string;
  faIcon?: IconProp;
  label: string;
  value: string | number;
  help?: string;
  ariaLabel?: string;
};

@Component({
  selector: 'app-metric-cards',
  standalone: true,
  imports: [CommonModule, FaIconComponent],
  templateUrl: './metric-cards.component.html',
  styleUrls: ['./metric-cards.component.scss'],
})
export class MetricCardsComponent {
  @Input() items: MetricItem[] = [];
  @Input() columns = 3;
  trackByIdx = (i: number) => i;
}