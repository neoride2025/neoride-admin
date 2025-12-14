import { TrafficComponent } from './../../components/traffic/traffic.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { WidgetsComponent } from '../../components/widgets/widgets.component';
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
    private helperService: HelperService
  ) {
    const data = helperService.getDataFromSession('userInfo');
    console.log(data);
  }

}
