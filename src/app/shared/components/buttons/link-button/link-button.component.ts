import { Component, Input } from '@angular/core';
import { ActivatedRoute, NavigationBehaviorOptions, NavigationExtras, Router } from '@angular/router';
import { ButtonComponent } from '../button/button.component';
import { FaIconComponent } from '../../icons/fa-icon.component';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-link-button',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    FaIconComponent
  ],
  templateUrl: './link-button.component.html',
  styleUrl: './link-button.component.scss'
})
export class LinkButtonComponent {
  @Input({ required: true }) to!: string | any[];
  @Input() icon?: IconProp | string;
  @Input() iconClass = 'mr-2';
  @Input() variant: 'primary' | 'ghost' | 'clean' | 'danger' = 'primary';
  @Input() label = 'Abrir';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() extras?: NavigationExtras;
  @Input() relativeTo?: ActivatedRoute;

  get iconForFa(): IconProp | undefined {
    return this.icon ? (this.icon as unknown as IconProp) : undefined;
  }

  constructor(private router: Router) { }

  go() {
    if (this.disabled || this.loading)
      return;
    if (Array.isArray(this.to))
      this.router.navigate(this.to, { relativeTo: this.relativeTo, ...(this.extras ?? {}) });
    else
      this.router.navigateByUrl(this.to, this.extras as NavigationBehaviorOptions);
  }
}