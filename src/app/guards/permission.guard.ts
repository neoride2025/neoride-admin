import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthAPIService } from '../apis/auth.service';
import { PERMISSION_ROUTE_MAP } from '../others/permission-routes';
import { ToastService } from '../services/toast.service';

export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: any
) => {
  const auth = inject(AuthAPIService);
  const router = inject(Router);
  const toastService = inject(ToastService);
  const required = route.data['permissions'] as string[] | undefined;
  const userPerms = auth.getUserPermissions() || [];

  if (auth.isAdmin()) return true;

  if (required?.some(p => userPerms.includes(p))) {
    return true;
  }

  const target = getFirstAllowedRoute(userPerms, toastService);

  if (target && state.url !== target) {
    return router.createUrlTree([target]);
  }

  return router.createUrlTree(['/unauthorized']);
};

function getFirstAllowedRoute(permissions: string[], toastService: ToastService): string | null {
  for (const p of permissions) {
    const route = PERMISSION_ROUTE_MAP[p];
    if (route) return route;
  }
  toastService.info('You are not allowed to access this page');
  return null;
}
