import { Routes } from '@angular/router';
import { HomeComponent } from '../home/home.component';
import { CreateOwnerComponent } from '../fetures/onboarding/pages/create-owner/create-owner.component';
import { CreateCompanyComponent } from '../fetures/onboarding/pages/create-company/create-company.component';
import { DashboardResolver } from '../fetures/dashboard/resolver/dashboard.resolver';
import { DashboardComponent } from '../fetures/dashboard/pages/dashboard.component';
import { authGuard } from './auth/guards/auth.guard';


export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        pathMatch: 'full'
    },
    {
        path: 'onboarding',
        children: [
            { path: 'create-owner', component: CreateOwnerComponent },
            { path: 'create-company', component: CreateCompanyComponent }
        ]
    },
    {
        path: 'dashboard/:companyId',
        canMatch: [authGuard],
        component: DashboardComponent,
        resolve: { appointments: DashboardResolver }
    },
    { path: '**', redirectTo: '' }
];
