import { Injectable } from '@angular/core';
import { ChartData, ChartDataset, ChartOptions, ChartType, PluginOptionsByType, ScaleOptions, TooltipLabelStyle } from 'chart.js';
import { getStyle } from '@coreui/utils';
import { HelperService } from '../../services/helper.service';

export interface IChartProps {
  data?: ChartData;
  labels?: any;
  options?: ChartOptions;
  colors?: any;
  type: ChartType;
  legend?: any;

  [propName: string]: any;
}

@Injectable({
  providedIn: 'any'
})

export class TrafficChartsData {

  config: any = {};
  public mainChart: IChartProps = { type: 'line' };

  constructor(
    private helperServ: HelperService
  ) {
    this.config = helperServ.config;
    this.initChart();
  }

  initChart() {
    const datasets: ChartDataset[] = [
      {
        // Rapido – lowest fares
        data: [120, 180, 95, 260, 210, 300, 175, 140, 320, 200, 260, 150],
        label: 'Rapido',
        backgroundColor: 'rgba(0, 177, 89, 0.2)',
        borderColor: '#00B159',
        pointHoverBackgroundColor: '#fff',
        fill: true
      },
      {
        // Uber – consistently high + surge
        data: [550, 720, 680, 840, 610, 900, 760, 690, 880, 730, 810, 950],
        label: 'Uber',
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        borderColor: '#000000',
        pointHoverBackgroundColor: '#fff',
      },
      {
        // OLA – wide fluctuations
        data: [300, 780, 260, 920, 220, 860, 340, 970, 290, 810, 250, 900],
        label: 'OLA',
        backgroundColor: 'rgba(255, 206, 0, 0.25)',
        borderColor: '#FFCE00',
        pointHoverBackgroundColor: '#fff'
      },
      {
        // Namma Yatri – regulated & stable mid-range
        data: [380, 420, 400, 450, 430, 410, 460, 390, 480, 440, 470, 415],
        label: 'Namma Yatri',
        backgroundColor: 'rgba(0, 102, 204, 0.2)',
        borderColor: '#0066CC',
        pointHoverBackgroundColor: '#fff'
      }
    ]

    const plugins = {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          labelColor: (context: any) => ({ backgroundColor: context.dataset.borderColor } as TooltipLabelStyle)
        }
      }
    };

    const scales = this.getScales();
    const options: ChartOptions = {
      maintainAspectRatio: false,
      plugins,
      scales,
      elements: {
        line: {
          tension: 0.4,
          borderWidth: 2.5
        },
        point: {
          radius: 0,
          hitRadius: 10,
          hoverRadius: 4,
          hoverBorderWidth: 8
        }
      }
    };
    this.mainChart.options = options;
    this.mainChart.data = {
      datasets,
      labels: this.config.months
    };
    console.log('main chart data : ', this.mainChart.data);
  }

  getScales() {
    const colorBorderTranslucent = getStyle('--cui-border-color-translucent');
    const colorBody = getStyle('--cui-body-color');

    const scales: ScaleOptions<any> = {
      x: {
        grid: {
          color: colorBorderTranslucent,
          drawOnChartArea: false
        },
        ticks: {
          color: colorBody
        }
      },
      y: {
        border: {
          color: colorBorderTranslucent
        },
        grid: {
          color: colorBorderTranslucent
        },
        max: 1000,
        beginAtZero: true,
        ticks: {
          color: colorBody,
          maxTicksLimit: 5,
          stepSize: Math.ceil(250 / 5)
        }
      }
    };
    return scales;
  }
}
