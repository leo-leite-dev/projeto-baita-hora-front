import { Routes } from '@angular/router';
import { HomeComponent } from '../home/home.component';
import { CreateOwnerComponent } from '../fetures/onboarding/pages/create-owner/create-owner.component';
import { CreateCompanyComponent } from '../fetures/onboarding/pages/create-company/create-company.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        pathMatch: 'full'
    },
    {
        path: 'onboarding',
        children: [
            {
                path: 'create-owner',
                component: CreateOwnerComponent
            },
            {
                path: 'create-company',
                component: CreateCompanyComponent
            }
        ]
    },
    { path: '**', redirectTo: '' }
];