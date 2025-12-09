import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent, ButtonVariant } from '../../../components/buttons/button/button.component';
import { FaIconComponent } from '../../../components/icons/fa-icon.component';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-menu-item',
  standalone: true,
  imports: [CommonModule, ButtonComponent, FaIconComponent],
  templateUrl: './profile-menu-item.component.html',
})
export class ProfileMenuItemComponent {
  @Input() label: string = '';
  @Input() icon?: IconProp;
  @Input() variant: ButtonVariant = 'ghost';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;

  @Output() clicked = new EventEmitter<void>();

  onClick() {
    if (!this.disabled && !this.loading) 
      this.clicked.emit();
  }
}