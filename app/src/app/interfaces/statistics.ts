import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexYAxis,
  ApexStroke,
} from 'ng-apexcharts';

export interface statistics {
  id: string;
  vesselName: string;
  eta: string;
  etb?: string;
  etc?: string;
  tonnage: string;
  cargo: string;
  importer: string;
  trader: string;
  loadingPort: string;
  country: string;
  dischargingPort: string;
}

export interface ChartInterface {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
}

export interface chartData {
  data: String;
  value: Number;
}

export interface chartRequest {
  year: String;
  startMonth: String;
  endMonth: String;
}
