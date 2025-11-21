import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AbilityService } from '../../../core/auth';
import { PendingAttendanceService } from '../../services/pending-attendance.service';

export interface MenuItem {
  label: string;
  icon?: string;
  route?: string;
  requiresCompanyId?: boolean;
  submenu?: MenuItem[];
}

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent {
  private pendingAttendance = inject(PendingAttendanceService);

  menuExpanded = true;
  menuExpandedOnMobile = false;
  selectedMenuTitle: string | null = null;

  private openMapL2 = new Set<string>();

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'article',
      route: '/app/dashboard',
      requiresCompanyId: true
    },
    {
      label: 'Minha Agenda',
      icon: 'event',
      route: '/app/my-schedule'
    },
    {
      label: 'Gerenciamento',
      icon: 'build',
      submenu: [
        {
          label: 'Serviços',
          submenu: [
            { label: 'Criar Serviço', route: '/app/service-offering/create' },
            { label: 'Meus Serviços', route: '/app/service-offering/list' },
          ],
        },
        {
          label: 'Cargos',
          submenu: [
            { label: 'Criar Cargo', route: '/app/position/create' },
            { label: 'Meus Cargos', route: '/app/position/list' },
          ],
        },
        {
          label: 'Membros',
          submenu: [
            { label: 'Criar Membro', route: '/app/member/create' },
            { label: 'Meus Funcionários', route: '/app/member/list' },
          ],
        },
      ],
    },
  ];

  private router = inject(Router);
  private ability = inject(AbilityService);

  pendingUnknownTotal = this.pendingAttendance.pendingUnknownTotal;

  get canViewDashboard() {
    return this.ability.canViewDashboard();
  }

  get canManage() {
    return this.ability.canManageCompany();
  }

  toggleMenu() {
    this.menuExpanded = !this.menuExpanded;
    if (!this.menuExpanded) {
      this.selectedMenuTitle = null;
      this.openMapL2.clear();
    }
  }

  toggleSubmenu(item: MenuItem) {
    this.selectedMenuTitle = this.selectedMenuTitle === item.label ? null : item.label;
    this.openMapL2.clear();
  }

  isOpenL2(parent: string, child: string): boolean {
    return this.openMapL2.has(`${parent}|${child}`);
  }

  toggleSubmenu2(parent: string, subItem: MenuItem) {
    const key = `${parent}|${subItem.label}`;
    if (this.openMapL2.has(key))
      this.openMapL2.delete(key);

    else
      this.openMapL2.add(key);
  }

  navigateTo(item: MenuItem) {
    if (!item.route)
      return;

    this.router.navigateByUrl(item.route);
  }
}