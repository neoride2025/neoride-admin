import { Injectable } from '@angular/core';
import { Config } from '../others/config';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class HelperService {

  config = new Config();
  mobilePattern = /^[6-9][0-9]{9}$/;
  emailPattern: any = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;

  constructor(
    private router: Router,
    private toastService: ToastService
  ) { }

  goTo(path: string, param1?: string, param2?: string, data?: any) {
    let routerArray: any = [];
    if (param2)
      routerArray = [path, param1, param2];
    else if (param1)
      routerArray = [path, param1];
    else
      routerArray = [path];
    this.router.navigate(routerArray, data);
  }

  // clear the session data & navigate to login
  logout(logoutMessage?: string) {
    sessionStorage.clear();
    logoutMessage = logoutMessage ? logoutMessage : 'Logout Successfully';
    this.toastService.success(logoutMessage);
    this.clearCookie('refreshToken');
    this.goTo('login');
  }

  // validate email - email should match with the pattern
  validateEmail(email: string) {
    if (!email)
      return false;
    else if (!email.match(this.emailPattern))
      return false;
    else
      return true;
  }

  // validate mobile - mobile 10 digits only we are checking
  validateMobile(mobile: string) {
    // no PatternValidator, only number should be >= 10
    if (!mobile || mobile.length < 10)
      return false;
    else if (!this.mobilePattern.test(mobile)) // it should contain only numbers
      return false;
    else
      return true;
  }

  setDataToSession(key: string, data: any) {
    sessionStorage.setItem(key, JSON.stringify(data));
  }

  getDataFromSession(key: string) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
    return JSON.parse(JSON.stringify(sessionStorage.getItem(key)));
  }

  clearCookie(name: string, path = '/') {
    document.cookie = `${name}=; Max-Age=0; path=${path}`;
  }

  getRandomCoreUIColor(): any {
    const colors: any[] = [
      'primary',
      'secondary',
      'success',
      'danger',
      'warning',
      'info'
    ];

    const index = Math.floor(Math.random() * colors.length);
    return colors[index];
  }

}
