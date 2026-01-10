import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class ToastService {

  toast = inject(MessageService);

  success(message: string, header = 'Success') {
    this.toast.add({ severity: 'success', summary: header, detail: message, life: 1500 });
  }

  error(message: string, header = 'Error') {
    this.toast.add({ severity: 'error', summary: header, detail: message, life: 2500 });
  }

  info(message: string, header = 'Info') {
    this.toast.add({ severity: 'info', summary: header, detail: message, life: 2000 });
  }
}
