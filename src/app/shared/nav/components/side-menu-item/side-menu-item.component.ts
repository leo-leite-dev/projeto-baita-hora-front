import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProfileMenuItemComponent } from '../profile-menu-item/profile-menu-item.component';

export interface MenuItem {
  label: string;
  icon?: string;
  route?: string;
  requiresCompanyId?: boolean;
  submenu?: MenuItem[];
}

@Component({
  selector: 'app-side-menu-item',
  standalone: true,
  imports: [CommonModule, MatIconModule, ProfileMenuItemComponent],
  templateUrl: './side-menu-item.component.html',
  styleUrls: ['./side-menu-item.component.scss'],
})
export class SideMenuItemComponent {
  @Input() item!: MenuItem;
  @Input() menuExpanded!: boolean;
  @Input() selectedMenuTitle!: string | null;

  @Input() canViewDashboard!: boolean;
  @Input() canManage!: boolean;
  @Input() pendingUnknownTotal!: number;

  @Output() toggleSubmenu = new EventEmitter<MenuItem>();
  @Output() toggleSubmenuItem = new EventEmitter<{ parent: MenuItem; subItem: MenuItem }>();
  @Output() navigate = new EventEmitter<MenuItem>();

  @Input() isSubmenuItemOpen!: (parent: string, child: string) => boolean;
}
