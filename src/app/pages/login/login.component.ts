import { AuthAPIService } from './../../apis/auth.service';
import { SharedModule } from './../../others/shared.module';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HelperService } from '../../services/helper.service';
import { ToastBodyComponent, ToastComponent, ToastHeaderComponent } from '@coreui/angular';
import { ToastService } from '../../services/toast.service';
import { ProfileAPIService } from '../../apis/profile.service';
import { LoaderComponent } from '../../global-components/loader/loader.component';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [SharedModule, LoaderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoginComponent {

  loginForm: any = {
    email: 'admin@neoride.in',
    password: 'admin@neoride.in'
  };

  showLoader: boolean = false;

  constructor(
    private authService: AuthAPIService,
    private helperService: HelperService,
    private auth: AuthAPIService,
    private toastService: ToastService,
    private profile: ProfileAPIService
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
    this.showLoader = true;
    this.authService.login(this.loginForm).subscribe((res: any) => {
      console.log('res : ', res);
      if (res.status === 200) { // it should not be a user
        if (res.role === 'USER') {
          this.toastService.error('Invalid login');
          this.showLoader = false;
          return;
        }
        //   if (res.user.role === 'MODERATOR') { // set the permissions in the session for moderator to handle routes
        //     this.helperService.setDataToSession('permissions', res.user.permissions);
        //   }
        this.auth.setAccessToken(res.accessToken);
        //   this.helperService.setDataToSession('userInfo', res.user);
        //   this.helperService.goTo('dashboard');
        this.getUserProfile();
        this.toastService.success(res.message);
      }
    }, err => {
      this.showLoader = false;
      console.log('login err : ', err);
      this.toastService.error(err.error.message);
    })
  }

  getUserProfile() {
    this.showLoader = true;
    this.profile.getProfileDetails().subscribe((res: any) => {
      this.showLoader = false;
      if (res.status === 200) {
        this.helperService.setDataToSession('userInfo', res.data);
        this.helperService.setDataToSession('permissions', res.data.role.permissions);
        this.helperService.goTo('dashboard');
      }
    }, err => {
      this.showLoader = false;
      console.log('err : ', err);
    })
  }
}
