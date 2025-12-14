import { TrafficComponent } from './../../components/traffic/traffic.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { WidgetsComponent } from '../../components/widgets/widgets.component';
import { DashboardAPIService } from '../../apis/dashboard.service';
import { AuthAPIService } from '../../apis/auth.service';
import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'app-dashboard',
  imports: [WidgetsComponent, TrafficComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardComponent {

  constructor(
    private dashboardService: DashboardAPIService,
    private authAPIService: AuthAPIService,
    private helperService: HelperService
  ) {
    this.getContactForms();
    const data = helperService.getDataFromSession('userInfo');
    console.log(data);
  }

  getContactForms() {
    this.dashboardService.getContactForm().subscribe(res => {
      console.log('contact form : ', res);
    }, err => {
      console.log('err : ', err);
      this.authAPIService.refreshToken().subscribe(res => {
        console.log('rerfer. : ', res);
      }, error => {
        console.log('fdsfsd. ', error);
      })
    })
  }
}
