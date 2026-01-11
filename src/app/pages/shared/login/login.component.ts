import { AdminAPIService } from '../../../apis/admin.service';
import { AuthAPIService } from '../../../apis/auth.service';
import { SharedModule } from '../../../others/shared.module';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { HelperService } from '../../../services/helper.service';
import { ToastService } from '../../../services/toast.service';
import { LoaderComponent } from '../../../global-components/loader/loader.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [SharedModule, LoaderComponent, NgClass],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginComponent {

  // injectable dependencies
  private helperService = inject(HelperService);
  private auth = inject(AuthAPIService);
  private toastService = inject(ToastService);
  private admin = inject(AdminAPIService);

  loading = false;
  loaderMessage = '';
  showPassword = false;
  loginForm: any = {
    email: 'admin@neoride.in',
    password: 'admin@neoride.in'
  };

  ngOnInit() {
    sessionStorage.clear(); // clear session data when page loads
  }

  validateForm() {
    if (!this.loginForm.email)
      return this.toastService.error('Please enter email', 'Login');
    else if (!this.helperService.validateEmail(this.loginForm.email))
      return this.toastService.error('Please enter valid email');
    else if (!this.loginForm.password)
      return this.toastService.error('Please enter password');
    else if (this.loginForm.password.length < 6)
      return this.toastService.error('Password should be minimum 6 characters');
    return true;
  }

  login() {
    const validateForm = this.validateForm();
    if (!validateForm) return;
    this.loading = true;
    this.loaderMessage = 'Logging in...';
    this.auth.login(this.loginForm).subscribe((res: any) => {
      if (res.status === 200) { // it should not be a user
        const ROLE = res.data.staffType;
        if (ROLE === 'USER') {
          this.toastService.error('Invalid login');
          this.loading = false;
          return;
        }
        this.helperService.setDataToSession('userInfo', res.data);
        this.helperService.setDataToSession('permissions', res.data.permissions);
        this.getNavigationItems(ROLE);
        this.toastService.success(res.message);
      }
      else
        this.loading = false;
    }, err => {
      this.loading = false;
      this.toastService.error(err.error.message);
    })
  }

  getNavigationItems(role: string) {
    this.loaderMessage = 'Getting profile details...';
    this.admin.getNavigationMenuItems().subscribe((res: any) => {
      this.loading = false;
      if (res.status === 200) {
        this.helperService.setDataToSession('navigationItems', res.data);
        this.helperService.goTo(role.toLowerCase());
      }
    }, err => {
      this.loading = false;
      this.toastService.error(err.error.message);
    })
  }
}
