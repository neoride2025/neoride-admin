import { AuthAPIService } from '../apis/auth.service';
import { Injectable } from '@angular/core';
import { HttpInterceptor, } from '@angular/common/http';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError, BehaviorSubject, EMPTY } from 'rxjs';
import { HttpRequest, HttpHandler } from '@angular/common/http';
import { HelperService } from '../services/helper.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private auth: AuthAPIService,
    private helperService: HelperService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    const accessToken = this.auth.getAccessToken() || sessionStorage.getItem('accessToken');

    const isAuthApi = req.url.includes('/auth/login') || req.url.includes('/auth/register') || req.url.includes('/auth/refresh-token');


    const authReq = accessToken ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } }) : req;

    return next.handle(authReq).pipe(
      catchError(err => {
        // 🔴 DO NOT refresh for auth APIs
        if (isAuthApi)
          return throwError(() => err);

        if (err.status === 401 && !this.isRefreshing) {
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
            catchError(error => {
              this.isRefreshing = false;
              this.auth.logout();
              this.helperService.goTo('login');
              return EMPTY;
            })
          );
        }

        return throwError(() => err);
      })
    );
  }
}
