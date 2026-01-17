import { STAFF_TYPE_OPTIONS } from './../../core/constants/staff-type.constants';
import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('../../layout').then(m => m.DefaultLayoutComponent),
        canActivate: [],
        data: { role: STAFF_TYPE_OPTIONS[0].value },
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
            // Staff Management
            {
                path: 'roles',
                loadComponent: () => import('./roles/roles.component').then(c => c.RolesComponent)
            },
            {
                path: 'permissions',
                loadComponent: () => import('./permissions/permissions.component').then(c => c.PermissionsComponent)
            },
            {
                path: 'navigation',
                loadComponent: () => import('./navigation/navigation.component').then(c => c.NavigationComponent)
            },
            {
                path: 'staffs',
                loadComponent: () => import('./staffs/staffs.component').then(c => c.StaffsComponent)
            },
            // Organization Management
            {
                path: 'organizations',
                loadComponent: () => import('./organizations/organizations.component').then(c => c.OrganizationsComponent)
            },
            {
                path: 'org-users',
                loadComponent: () => import('./org-users/org-users.component').then(c => c.OrgUsersComponent)
            }
        ]
    }
];
