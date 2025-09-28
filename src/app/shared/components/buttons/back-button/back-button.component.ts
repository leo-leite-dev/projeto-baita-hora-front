import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute, NavigationBehaviorOptions } from '@angular/router';
import { ButtonComponent } from '../button/button.component';
import { FaIconComponent } from '../../icons/fa-icon.component';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [ButtonComponent, FaIconComponent],
  templateUrl: './back-button.component.html',
})
export class BackButtonComponent {
  @Input({ required: true }) to!: string | any[];
  @Input() label = 'Voltar';
  @Input() variant: 'primary' | 'ghost' | 'clean' | 'danger' = 'ghost';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() extras?: NavigationBehaviorOptions;
  @Input() relativeTo?: ActivatedRoute;

  constructor(private router: Router) { }

  onBack() {
    if (Array.isArray(this.to))
      this.router.navigate(this.to, { relativeTo: this.relativeTo, ...(this.extras ?? {}) });
    else
      this.router.navigateByUrl(this.to, this.extras);
  }
}