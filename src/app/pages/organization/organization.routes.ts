import { STAFF_TYPE_OPTIONS } from '../../core/constants/staff-type.constants';
import { Routes } from '@angular/router';

export const ORGANIZATION_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('../../layout').then(m => m.DefaultLayoutComponent),
        canActivate: [],
        data: { role: STAFF_TYPE_OPTIONS[1].value },
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            // Overview
            {
                path: 'dashboard',
                loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent)
            },
        ]
    }
];
