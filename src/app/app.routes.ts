import { ROUTES, Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/shared/login/login.component').then(m => m.LoginComponent),
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/shared/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
    data: { isFallback: true }
  },
  {
    path: '404',
    loadComponent: () => import('./pages/shared/page404/page404.component').then(m => m.Page404Component),
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    loadComponent: () => import('./pages/shared/page500/page500.component').then(m => m.Page500Component),
    data: {
      title: 'Page 500'
    }
  },
  // ============ ADMIN ROUTES ============
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  // ============ ORGANIZATION ROUTES ============
  {
    path: 'org',
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  { path: '**', redirectTo: '404' },
];
