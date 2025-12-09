import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AbilityService, AuthContextService } from '../../../core/auth';
import { PendingAttendanceService } from '../../services/pending-attendance.service';
import { CompanyRole } from '../../enums/company-role.enum';
import { ProfileDrawerComponent } from '../components/profile-drawer/profile-drawer.component';
import { SessionService } from '../../../core/auth/services/session.service';
import { MenuItem, SideMenuItemComponent } from '../components/side-menu-item/side-menu-item.component';

export interface SideMenuUser {
  username: string;
  role: CompanyRole;
}

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ProfileDrawerComponent,
    SideMenuItemComponent,
  ],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
})
export class SideMenuComponent implements OnInit {
  private readonly pendingAttendance = inject(PendingAttendanceService);
  private readonly ability = inject(AbilityService);
  private readonly router = inject(Router);
  private readonly authCtx = inject(AuthContextService);
  private readonly session = inject(SessionService);

  private openMapL2 = new Set<string>();

  menuExpanded = true;
  menuExpandedOnMobile = false;
  isProfileMenuOpen = false;
  selectedMenuTitle: string | null = null;
  authUser: SideMenuUser | null = null;

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'article',
      route: '/app/dashboard',
      requiresCompanyId: true,
    },
    {
      label: 'Minha Agenda',
      icon: 'event',
      route: '/app/my-schedule',
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

  pendingUnknownTotal = this.pendingAttendance.pendingUnknownTotal;

  get canViewDashboard() {
    return this.ability.canViewDashboard();
  }

  get canManage() {
    return this.ability.canManageCompany();
  }

  ngOnInit() {
    this.authCtx.state$.subscribe(state => {
      if (!state.isAuthenticated) {
        this.authUser = null;
        return;
      }

      this.authUser = {
        username: state.username,
        role: state.role,
      };
    });
  }

  toggleMenu() {
    this.menuExpanded = !this.menuExpanded;
    if (!this.menuExpanded) {
      this.selectedMenuTitle = null;
      this.openMapL2.clear();
    }
  }

  toggleSubmenu(item: MenuItem) {
    this.selectedMenuTitle =
      this.selectedMenuTitle === item.label ? null : item.label;
    this.openMapL2.clear();
  }

  isSubmenuItemOpen(parent: string, child: string): boolean {
    return this.openMapL2.has(`${parent}|${child}`);
  }

  toggleSubmenuItem(parent: MenuItem, subItem: MenuItem) {
    const key = `${parent.label}|${subItem.label}`;
    if (this.openMapL2.has(key))
      this.openMapL2.delete(key);
    else
      this.openMapL2.add(key);
  }

  navigateTo(item: MenuItem) {
    if (!item.route) return;

    this.router.navigateByUrl(item.route);
  }

  onProfileClick(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  logout(): void {
    this.session.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('/auth/login');
      },
      error: err => {
        console.error('Erro ao deslogar', err);
        this.router.navigateByUrl('/auth/login');
      },
    });
  }

  goToProfileDetails(): void {
    this.isProfileMenuOpen = false;
    this.router.navigateByUrl('/app/profile/details');
  }

  goToProfileSettings(): void {
    this.isProfileMenuOpen = false;
    this.router.navigateByUrl('/app/profile/details');
  }
}