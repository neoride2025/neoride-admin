import { AuthAPIService } from './../../apis/auth.service';
import { SharedModule } from './../../others/shared.module';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HelperService } from '../../services/helper.service';
import { ToastBodyComponent, ToastComponent, ToastHeaderComponent } from '@coreui/angular';
import { ToastService } from '../../services/toast.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [SharedModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginComponent {

  loginForm: any = {};

  constructor(
    private authService: AuthAPIService,
    private helperService: HelperService,
    private auth: AuthAPIService,
    private toastService: ToastService
  ) {

  }

  ngOnInit() {
    sessionStorage.clear(); // clear session data when page loads
  }

  validateForm() {
    if (!this.loginForm.email)
      return this.toastService.error('Please enter email');
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
    this.authService.login(this.loginForm).subscribe((res: any) => {
      if (res.status === 200) { // it should not be a user
        if (res.user.role === 'USER') {
          this.toastService.error('Invalid login');
          return;
        }
        if (res.user.role === 'MODERATOR') { // set the permissions in the session for moderator to handle routes
          this.helperService.setDataToSession('permissions', res.user.permissions);
        }
        this.auth.setAccessToken(res.accessToken);
        this.helperService.setDataToSession('userInfo', res.user);
        this.helperService.goTo('dashboard');
        this.toastService.success(res.message);
      }

    }, err => {
      console.log('login err : ', err);
      this.toastService.error(err.error.message);
    })
  }
}
