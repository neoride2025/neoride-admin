import { AuthAPIService } from '../apis/auth.service';
import { Injectable } from '@angular/core';
import { HttpInterceptor, } from '@angular/common/http';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { throwError, BehaviorSubject, EMPTY } from 'rxjs';
import { HttpRequest, HttpHandler } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private auth: AuthAPIService,
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    // ✅ Only intercept API calls
    if (!req.url.startsWith(environment.apiURL)) {
      return next.handle(req);
    }

    const accessToken = this.auth.getAccessToken() || sessionStorage.getItem('accessToken');

    const authReq = accessToken ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } }) : req;

    return next.handle(authReq).pipe(
      catchError(err => {

        // check condition to skip refreshing
        if (!this.shouldRefreshToken(req, err)) {
          return throwError(() => err);
        }

        // 🔄 refresh flow
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          this.refreshSubject.next(null);

          return this.auth.refreshToken().pipe(
            switchMap((res: any) => {
              this.isRefreshing = false;
              this.auth.setAccessToken(res.accessToken);
              this.refreshSubject.next(res.accessToken);

              return next.handle(
                req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${res.accessToken}`
                  }
                })
              );
            }),
            catchError(() => {
              this.isRefreshing = false;
              this.auth.logout();
              return EMPTY;
            })
          );
        }

        // 🟡 wait for refresh in progress
        return this.refreshSubject.pipe(
          filter(token => token !== null),
          take(1),
          switchMap(token =>
            next.handle(
              req.clone({
                setHeaders: { Authorization: `Bearer ${token}` }
              })
            )
          )
        );
      })
    );
  }

  private shouldRefreshToken(req: HttpRequest<any>, err: any): boolean {
    return (
      err.status === 401 &&
      err.error?.error === 'ACCESS_TOKEN_EXPIRED' &&
      !req.url.includes('/auth/login') &&
      !req.url.includes('/auth/register') &&
      !req.url.includes('/auth/refresh-token')
    );
  }

}
