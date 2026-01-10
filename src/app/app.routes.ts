import { Routes } from '@angular/router';
import { permissionGuard } from './guards/permission.guard';
const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '',
    loadComponent: () => import('./layout').then(m => m.DefaultLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [permissionGuard],
        data: {
          title: 'Dashboard',
          permissions: ['VIEW_DASHBOARD'],
        }
      },
      {
        path: 'contacts',
        loadComponent: () => import('./pages/contacts/contacts.component').then(m => m.ContactsComponent),
        canActivate: [permissionGuard],
        data: {
          permissions: ['VIEW_CONTACTS'],
          isFallback: true
        }
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent),
        canActivate: [permissionGuard],
        data: {
          permissions: ['VIEW_USERS'],
          isFallback: true
        }
      },
      {
        path: 'moderators',
        loadComponent: () => import('./pages/moderators/moderators.component').then(m => m.ModeratorsComponent),
        canActivate: [permissionGuard],
        data: {
          permissions: ['VIEW_MODERATORS'],
          isFallback: true
        }
      },
      {
        path: 'roles',
        loadComponent: () => import('./pages/roles/roles.component').then(m => m.RolesComponent),
        canActivate: [permissionGuard],
        data: {
          permissions: ['VIEW_ROLES'],
          isFallback: true
        }
      },
      {
        path: 'modules',
        loadComponent: () => import('./pages/modules-and-permissions/modules-and-permissions.component').then(m => m.ModulesAndPermissionsComponent),
        canActivate: [permissionGuard],
        data: {
          permissions: ['VIEW_MODULES'],
          isFallback: true
        }
      },
    ]
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
    data: { isFallback: true }
  },
  {
    path: '404',
    loadComponent: () => import('./pages/page404/page404.component').then(m => m.Page404Component),
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    loadComponent: () => import('./pages/page500/page500.component').then(m => m.Page500Component),
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    data: {
      title: 'Register Page'
    }
  },
  { path: '**', redirectTo: 'home' }
];
