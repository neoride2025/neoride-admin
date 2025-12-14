import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ToastConfig } from '../others/toast.model';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSubject = new Subject<ToastConfig>();
  toast$ = this.toastSubject.asObservable();

  show(config: ToastConfig) {
    this.toastSubject.next({
      color: 'success',
      delay: 3000,
      position: 'top-end',
      ...config
    });
  }

  success(message: string, header = 'Success') {
    this.show({ message, header, color: 'success' });
  }

  error(message: string, header = 'Error') {
    this.show({ message, header, color: 'danger' });
  }

  info(message: string, header = 'Info') {
    this.show({ message, header, color: 'info' });
  }
}
