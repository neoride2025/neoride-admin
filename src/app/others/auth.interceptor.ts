import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse
} from '@angular/common/http';
import { BehaviorSubject, throwError } from 'rxjs';
import {
  catchError,
  filter,
  switchMap,
  take,
  finalize
} from 'rxjs/operators';
import { AuthAPIService } from '../apis/auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  constructor(private auth: AuthAPIService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    // Ignore non-API calls
    if (!req.url.startsWith(environment.apiURL)) {
      return next.handle(req);
    }

       return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {

        /* 🔴 FORBIDDEN → LOGOUT IMMEDIATELY */
        if (err.status === 403) {
          this.auth.logout();
          return throwError(() => err);
        }

        /* ❌ NOT A REFRESH CASE */
        if (!this.shouldRefreshToken(req, err)) {
          return throwError(() => err);
        }

        /* 🔄 FIRST 401 TRIGGERS REFRESH */
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          this.refreshSubject.next(null);

          return this.auth.refreshToken().pipe(
            switchMap(() => {
              // retry original request AFTER refresh
              return next.handle(req);
            }),
            catchError((refreshErr) => {
              this.refreshSubject.error(refreshErr);
              this.auth.logout();
              return throwError(() => refreshErr);
            }),
            finalize(() => {
              this.isRefreshing = false;
            })
          );
        }

        /* ⏳ QUEUE REQUESTS WHILE REFRESHING */
        return this.refreshSubject.pipe(
          filter(token => token !== null),
          take(1),
          switchMap(token =>
            next.handle(req)
          )
        );
      })
    );
  }

  private shouldRefreshToken(req: HttpRequest<any>, err: HttpErrorResponse): boolean {
    return (
      err.status === 401 &&
      !req.url.includes('/auth/login') &&
      !req.url.includes('/auth/register') &&
      !req.url.includes('/auth/refresh-token')
    );
  }
}
