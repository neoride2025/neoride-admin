import { PERMISSIONS } from '../../core/constants/permissions.constants';
import { permissionGuard } from '../../guards/permission.guard';
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
                loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardComponent),
                canActivate: [permissionGuard],
                data: { permissions: [PERMISSIONS.ADMIN_DASHBOARD_VIEW], }
            },
            // Staff Management
            {
                path: 'roles',
                loadComponent: () => import('./roles/roles.component').then(c => c.RolesComponent),
                canActivate: [permissionGuard],
                data: { permissions: [PERMISSIONS.ADMIN_ROLES_VIEW], }
            },
            {
                path: 'permissions',
                loadComponent: () => import('./permissions/permissions.component').then(c => c.PermissionsComponent),
                canActivate: [permissionGuard],
                data: { permissions: [PERMISSIONS.ADMIN_PERMISSIONS_VIEW], }
            },
            {
                path: 'navigation',
                loadComponent: () => import('./navigation/navigation.component').then(c => c.NavigationComponent),
                canActivate: [permissionGuard],
                data: { permissions: [PERMISSIONS.ADMIN_NAVIGATION_VIEW] }
            },
            {
                path: 'staffs',
                loadComponent: () => import('./staffs/staffs.component').then(c => c.StaffsComponent),
                canActivate: [permissionGuard],
                data: { permissions: [PERMISSIONS.ADMIN_STAFFS_VIEW] }
            },
            // Organization Management
            {
                path: 'organizations',
                loadComponent: () => import('./organizations/organizations.component').then(c => c.OrganizationsComponent),
                canActivate: [permissionGuard],
                data: { permissions: [PERMISSIONS.ADMIN_ORGANIZATIONS_VIEW] }
            },
            {
                path: 'org-users',
                loadComponent: () => import('./org-users/org-users.component').then(c => c.OrgUsersComponent),
                canActivate: [permissionGuard],
                data: { permissions: [PERMISSIONS.ADMIN_ORG_USERS_VIEW] }
            }
        ]
    }
];
