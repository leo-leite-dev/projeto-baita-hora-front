import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CompanyRole } from '../../../enums/company-role.enum';
import { FaIconComponent } from '../../../components/icons/fa-icon.component';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { ProfileMenuItemComponent } from '../profile-menu-item/profile-menu-item.component';

export interface SideMenuUser {
  username: string;
  role: CompanyRole;
}

@Component({
  selector: 'app-profile-drawer',
  standalone: true,
  imports: [CommonModule, FaIconComponent, ProfileMenuItemComponent],
  templateUrl: './profile-drawer.component.html',
  styleUrls: ['./profile-drawer.component.scss']
})
export class ProfileDrawerComponent {

  @Input() authUser!: SideMenuUser | null;
  @Input() menuExpanded: boolean = true;
  @Input() isOpen: boolean = false;

  @Output() toggle = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  @Output() profileDetails = new EventEmitter<void>();
  @Output() openSettings = new EventEmitter<void>();

  onToggle() {
    this.toggle.emit();
  }

  onLogout() {
    this.logout.emit();
  }

  onProfileDetails() {
    this.profileDetails.emit();
  }

  onOpenSettings() {
    this.openSettings.emit();
  }

  get roleIcon(): IconProp {
    switch (this.authUser?.role) {
      case 'Owner':
        return ['fas', 'crown'];
      case 'Manager':
        return ['fas', 'user-tie'];
      case 'Staff':
        return ['fas', 'user-gear'];
      case 'Viewer':
        return ['fas', 'eye'];
      default:
        return ['fas', 'question-circle'];
    }
  }

  get roleLabel(): string {
    switch (this.authUser?.role) {
      case 'Owner':
        return 'Proprietário';
      case 'Manager':
        return 'Gerente';
      case 'Staff':
        return 'Funcionário';
      case 'Viewer':
        return 'Visualizador';
      default:
        return 'Papel desconhecido';
    }
  }
}