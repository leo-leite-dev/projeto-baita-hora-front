import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';
import { guestGuard } from './auth/guards/guest.guard';
import { ShellComponent } from '../layout/shell.component';
import { ServiceOfferingResolver } from '../features/companies/service-offerings/resolver/service-offering.resolver';
import { PositionResolver } from '../features/companies/positions/resolver/position.resolver';
import { MemberResolver } from '../features/companies/members/resolver/member.resolver';
import { MemberEditFacade } from '../features/companies/members/data/member-edit.facade';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canMatch: [guestGuard],
    loadComponent: () =>
      import('../home/home.component').then(m => m.HomeComponent),
  },

  {
    path: 'onboarding',
    canMatch: [guestGuard],
    children: [
      {
        path: 'create-owner',
        loadComponent: () =>
          import('../features/onboarding/pages/create-owner/create-owner.component')
            .then(m => m.CreateOwnerComponent),
      },
      {
        path: 'create-company',
        loadComponent: () =>
          import('../features/onboarding/pages/create-company/create-company.component')
            .then(m => m.CreateCompanyComponent),
      },
    ],
  },
  {
    path: 'app',
    component: ShellComponent,
    canMatch: [authGuard],
    children: [
      {
        path: 'dashboard/:companyId',
        loadComponent: () =>
          import('../features/dashboard/pages/dashboard.component')
            .then(m => m.DashboardComponent),
        resolve: {
          appointments: () =>
            import('../features/dashboard/resolver/dashboard.resolver')
              .then(m => m.DashboardResolver),
        },
      },
      {
        path: 'service-offering',
        children: [
          {
            path: 'create',
            loadComponent: () =>
              import('../features/companies/service-offerings/pages/service-offering-create/service-offering-create.component')
                .then(m => m.ServiceOfferingCreateComponent),
          },
          {
            path: ':id/edit',
            resolve: { item: ServiceOfferingResolver },
            loadComponent: () =>
              import('../features/companies/service-offerings/pages/service-offering-edit/service-offering-edit.component')
                .then(m => m.ServiceOfferingEditComponent),
          },
          {
            path: 'list',
            loadComponent: () =>
              import('../features/companies/service-offerings/pages/service-offerings-list/service-offerings-list.component')
                .then(m => m.ServiceOfferingListComponent),
          },
          { path: '', pathMatch: 'full', redirectTo: 'list' },
        ],
      },
      {
        path: 'my-schedule',
        loadComponent: () =>
          import('../features/schedules/pages/my-schedule.component')
            .then(m => m.MyScheduleComponent),
      },
      {
        path: 'position',
        children: [
          {
            path: 'create',
            loadComponent: () =>
              import('../features/companies/positions/pages/position-create/position-create.component')
                .then(m => m.PositionCreateComponent),
          },
          {
            path: ':id/edit',
            resolve: { item: PositionResolver },
            loadComponent: () =>
              import('../features/companies/positions/pages/position-edit/position-edit.component')
                .then(m => m.PositionEditComponent),
          },
          {
            path: 'list',
            loadComponent: () =>
              import('../features/companies/positions/pages/positions-list/position-list.component')
                .then(m => m.PositionListComponent),
          },
          { path: '', pathMatch: 'full', redirectTo: 'list' },
        ],
      },
      {
        path: 'member',
        children: [
          {
            path: 'create',
            loadComponent: () =>
              import('../features/companies/members/pages/member-create/member-create.component')
                .then(m => m.MemberCreateComponent),
          },
          {
            path: ':id/edit',
            resolve: { member: MemberResolver },
            loadComponent: () =>
              import('../features/companies/members/pages/member-edit/member-edit.component')
                .then(m => m.MemberEditComponent),
          },
          {
            path: 'list',
            loadComponent: () =>
              import('../features/companies/members/pages/members-list/member-list.component')
                .then(m => m.MemberListComponent),
          },
          { path: '', pathMatch: 'full', redirectTo: 'list' },
        ],
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard/placeholder' },
      { path: '**', redirectTo: 'dashboard/placeholder' },
    ],
  },

  { path: '**', redirectTo: '' },
];