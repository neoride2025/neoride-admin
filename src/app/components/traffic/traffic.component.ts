import { Component, CUSTOM_ELEMENTS_SCHEMA, effect, inject, signal, WritableSignal } from '@angular/core';
import { CardBodyComponent, CardComponent } from '@coreui/angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IChartProps, TrafficChartsData } from './traffic-chart-data';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-traffic',
  imports: [CardComponent, CardBodyComponent, ChartjsComponent],
  templateUrl: './traffic.component.html',
  styleUrl: './traffic.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TrafficComponent {

  trafficData: any[] = [
    {
      provider: 'Rapido',
      data: [65, 59, 80, 81, 56, 55, 60]
    },
    {
      provider: 'Uber',
      data: [28, 48, 40, 19, 86, 27, 90]
    },
    {
      provider: 'Ola',
      data: [18, 48, 77, 9, 100, 27, 40]
    },
    {
      provider: 'Namma Yatri',
      data: [65, 87, 23, 69, 17, 35, 83]
    },
  ];
  public mainChart: IChartProps = { type: 'line' };
  public mainChartRef: WritableSignal<any> = signal(undefined);
  #mainChartRefEffect = effect(() => {
    if (this.mainChartRef()) {
      this.setChartStyles();
    }
  });
  readonly #trafficChartData: TrafficChartsData = inject(TrafficChartsData);

  constructor() { }

  ngOnInit() {
    // console.log(this.#trafficChartData);
    this.initCharts();
  }

  initCharts(): void {
    this.mainChartRef()?.stop();
    this.mainChart = this.#trafficChartData.mainChart;
    // console.log('main chart : ', this.mainChart);
  }


  handleChartRef($chartRef: any) {
    if ($chartRef) {
      this.mainChartRef.set($chartRef);
    }
  }

  prepareTrafficData() {

  }

  setChartStyles() {
    if (this.mainChartRef()) {
      setTimeout(() => {
        const options: ChartOptions = { ...this.mainChart.options };
        const scales = this.#trafficChartData.getScales();
        this.mainChartRef().options.scales = { ...options.scales, ...scales };
        this.mainChartRef().update();
      });
    }
  }
}
