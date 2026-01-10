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

    const token = sessionStorage.getItem('accessToken'); //  single source of truth

    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {

        if (!this.shouldRefreshToken(req, err)) {
          return throwError(() => err);
        }

        // 🔄 First request triggers refresh
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          this.refreshSubject.next(null);

          return this.auth.refreshToken().pipe(
            switchMap((res: any) => {
              return next.handle(req);
            }),
            catchError((refreshErr) => {
              this.refreshSubject.error(refreshErr);
              // this.auth.logout();
              return throwError(() => refreshErr);
            }),
            finalize(() => {
              this.isRefreshing = false;
            })
          );
        }

        //  Requests wait here until refresh finishes
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

  private shouldRefreshToken(req: HttpRequest<any>, err: HttpErrorResponse): boolean {
    return (
      err.status === 401 &&
      !req.url.includes('/auth/login') &&
      !req.url.includes('/auth/register') &&
      !req.url.includes('/auth/refresh-token')
    );
  }
}
