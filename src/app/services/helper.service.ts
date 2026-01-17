import { Injectable, inject } from '@angular/core';
import { Config } from '../others/config';
import { NavigationStart, Router } from '@angular/router';
import { ToastService } from './toast.service';
import { ConfirmationService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class HelperService {

  router = inject(Router);
  toastService = inject(ToastService);
  confirmService = inject(ConfirmationService);

  config = new Config();
  mobilePattern = /^[6-9][0-9]{9}$/;
  emailPattern: any = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
  passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  casePattern = /^[A-Z]+(_[A-Z]+)*$/;

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

  // instead of settimeout we can use this function
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // function to generate a random strong password for the moderator
  generatePassword(length: number = 12): string {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const all = upper + lower + numbers + symbols;

    if (length < 8) {
      throw new Error('Password length must be at least 8');
    }

    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);

    const pwd: string[] = [
      upper[randomValues[0] % upper.length],
      lower[randomValues[1] % lower.length],
      numbers[randomValues[2] % numbers.length],
      symbols[randomValues[3] % symbols.length],
    ];

    for (let i = 4; i < length; i++) {
      pwd.push(all[randomValues[i] % all.length]);
    }

    // Shuffle
    for (let i = pwd.length - 1; i > 0; i--) {
      const j = randomValues[i] % (i + 1);
      [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
    }

    return pwd.join('');
  }

  getStatusItems() {
    return [{ name: 'Active', value: true }, { name: 'Inactive', value: false }]
  }

  actionConfirmation(data: any, callback: any) {
    const { header, message, rejectBtnLabel, acceptBtnLabel } = data;
    this.confirmService.confirm({
      header,
      message,
      closable: false,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: rejectBtnLabel || 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: acceptBtnLabel || 'Save',
      },
      accept: () => {
        callback(1);
      },
      reject: () => {
        callback(0);
      },
    });
  }


}