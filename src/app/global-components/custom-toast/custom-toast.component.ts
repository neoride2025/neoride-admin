import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ToastModule } from '@coreui/angular';
import { ToastConfig } from '../../others/toast.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-custom-toast',
  imports: [ToastModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './custom-toast.component.html',
  styleUrl: './custom-toast.component.scss',
})
export class CustomToastComponent {

  visible = false;
  config: ToastConfig | null = null;

  constructor(private toastService: ToastService) {
    this.toastService.toast$.subscribe(cfg => {
      this.config = cfg;
      this.visible = true;
    });
  }

  onVisibleChange(val: boolean) {
    this.visible = val;

    if (!val) {
      setTimeout(() => {
        this.config = null;
      }, 0);
    }
  }
}
