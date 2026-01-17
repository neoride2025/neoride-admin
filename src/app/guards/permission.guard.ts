import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthAPIService } from '../apis/auth.service';
import { PERMISSION_ROUTE_MAP } from '../others/permission-routes';
import { ToastService } from '../services/toast.service';

export const permissionGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: any
) => {
  const auth = inject(AuthAPIService);
  const router = inject(Router);
  const toastService = inject(ToastService);
  const requiredPermissions = route.data['permissions'] as string[] | undefined;
  const userPerms = await auth.getUserPermissions() || [];
  if (requiredPermissions?.some(p => userPerms.includes(p))) {
    return true;
  }

  const target = getFirstAllowedRoute(userPerms, toastService);

  if (target && state.url !== target) {
    return router.createUrlTree([target]);
  }
  // do forced logout only if user has some permissions (basically user is logged in & trying to access unauthorized page)
  if (userPerms.length > 0)
    auth.logout();
  return router.createUrlTree(['/login']);
};

function getFirstAllowedRoute(permissions: string[], toastService: ToastService): string | null {
  for (const p of permissions) {
    const route = PERMISSION_ROUTE_MAP[p];
    if (route) return route;
  }
  // toastService.info('You are not allowed to access this page');
  return null;
}
