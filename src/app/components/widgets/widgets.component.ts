import { HelperService } from './../../services/helper.service';
import { Component } from '@angular/core';
import { RowComponent, ColComponent, WidgetStatAComponent, DropdownComponent, ButtonDirective, DropdownToggleDirective, TemplateIdDirective, DropdownMenuDirective, DropdownItemDirective } from '@coreui/angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconDirective } from '@coreui/icons-angular';
import { getStyle } from '@coreui/utils';

@Component({
  selector: 'app-widgets',
  imports: [RowComponent, ColComponent, WidgetStatAComponent, DropdownComponent, ButtonDirective, IconDirective, DropdownToggleDirective, DropdownMenuDirective, DropdownItemDirective, ChartjsComponent, TemplateIdDirective],
  templateUrl: './widgets.component.html',
  styleUrl: './widgets.component.scss',
})
export class WidgetsComponent {

  config: any = {};
  widgets: any[] = [
    { title: 'Users', current: '25k', new: 20.05, valueIncreased: true, color: 'primary', label: 'Total Users', chartType: 'line' },
    { title: 'Bookings', current: '123k', new: 12.50, valueIncreased: true, color: 'warning', label: 'Total Bookings', chartType: 'line' },
    { title: 'Orders', current: '44k', new: -5.25, valueIncreased: false, color: 'info', label: 'Total Orders', chartType: 'bar' },
    { title: 'Refunds', current: '.9k', new: 1, valueIncreased: true, color: 'danger', label: 'Initiated Refunds', chartType: 'line' },
  ];

  constructor(
    private helperServ: HelperService
  ) {
    this.config = this.helperServ.config;
  }

  ngOnInit() {
    this.makeWidgetBackgroundColor();
  }

  makeWidgetBackgroundColor() {
    for (let i = 0; i < this.widgets.length; i++) {
      const currentWidget = this.widgets[i]
      currentWidget.data = {
        labels: this.config.months,
        datasets: [{
          label: currentWidget.label,
          backgroundColor: i === 2 ? 'rgba(255,255,255,.2)' : 'transparent',
          borderColor: 'rgba(255,255,255,.55)',
          pointBackgroundColor: i !== 2 ? getStyle(`--cui-${currentWidget.color}`) : '',
          pointHoverBorderColor: i !== 2 ? getStyle(`--cui-${currentWidget.color}`) : '',
          data: [65, 59, 84, 84, 51, 55, 30, 65, 23, 12, 98, 34],
          barPercentage: i === 2 ? 0.7 : ''
        }]
      };
      const options = JSON.parse(JSON.stringify(this.config.widgetChartOptions));
      switch (i) {
        case 0: {
          currentWidget.options = options;
          break;
        }
        case 1: {
          options.scales.x = { display: false };
          options.scales.y = { display: false };
          options.elements.line.borderWidth = 2;
          options.elements.point.radius = 0;
          currentWidget.options = options;
          break;
        }
        case 2: {
          options.scales.x.grid = { display: false, drawTicks: false };
          options.scales.x.grid = { display: false, drawTicks: false, drawBorder: false };
          options.scales.y.min = undefined;
          options.scales.y.max = undefined;
          options.elements = {};
          currentWidget.options = options;
          break;
        }
        case 3: {
          options.elements.line.tension = 0;
          currentWidget.options = options;
          break;
        }
      }
    }
  }
}
