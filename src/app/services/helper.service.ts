import { Injectable } from '@angular/core';
import { Config } from '../others/config';
import { NavigationStart, Router } from '@angular/router';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class HelperService {

  config = new Config();
  mobilePattern = /^[6-9][0-9]{9}$/;
  emailPattern: any = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
  passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  casePattern = /^[A-Z]+(_[A-Z]+)*$/;

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

  // function to validate the key (only camel case)
  validateCase(key: string) {
    if (!key)
      return false;
    else if (!this.casePattern.test(key))
      return false;
    else
      return true;
  }

  // function to prepare the KEY (Dashboard => Dashboard, Contact view => CONTACT_VIEW)
  toCapsWithUnderscore(value: unknown): string {
    if (typeof value !== 'string') return '';

    return value
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, '_') // 👈 space + symbols → _
      .replace(/^_+|_+$/g, '')       // 👈 trim _
      .toUpperCase();
  }

  // function to prepare key from label/name text
  labelToPermissionKey(label: unknown): string {
    if (typeof label !== 'string') return '';

    const parts = label
      .trim()
      .replace(/[^a-zA-Z\s]/g, '') // remove symbols
      .split(/\s+/);

    if (parts.length < 2) return '';

    const action = parts[0];
    const module = parts.slice(1).join('_');

    return `${module}_${action}`.toUpperCase();
  }


  // function to close any modal when routing started
  closeModalIfOpened(callBack: any) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        callBack();
      }
    });
  }

  setDataToSession(key: string, data: any) {
    sessionStorage.setItem(key, JSON.stringify(data));
  }

  getDataFromSession(key: string) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
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
  // httpOnly: true,
  // secure: false, // 🔴 MUST be false on http://localhost
  // sameSite: "Lax", // 🔴 allows cross-origin POST
  // path: "/",
  // maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days