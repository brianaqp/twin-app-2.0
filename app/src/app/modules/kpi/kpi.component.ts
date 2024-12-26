import { Component, OnDestroy, OnInit } from '@angular/core';
import { RepositoriesService } from 'src/app/services/repositories.service';
import { Chart, registerables } from 'chart.js';
import { Observable } from 'rxjs';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-kpi',
  templateUrl: './kpi.component.html',
  styleUrls: ['./kpi.component.scss'],
})
export class KpiComponent implements OnInit, OnDestroy {
  // get year in YY
  currentYear = '24';
  yearCount!: number;
  // charts objects
  barChart!: Chart;

  constructor(private readonly repoSvc: RepositoriesService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.pullData().subscribe((data: any) => {
      this.yearCount = data.count;
      this.createBarChart();
    });
  }

  private pullData(): Observable<any> {
    return this.repoSvc.getDocsByYear('registers', this.currentYear);
  }

  createBarChart() {
    const ctx = (
      document.getElementById('myChart') as HTMLCanvasElement
    ).getContext('2d')!;
    const labels = ['2021', '2022', '2023', '2024'];

    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Registers per year',
          data: [146, 164, 171, this.yearCount],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 205, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(201, 203, 207, 0.2)',
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)',
          ],
          borderWidth: 1,
        },
      ],
    };

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  // final methods
  async print(): Promise<void> {
    this.barChart.resize(800, 300);
    this.barChart.update();
    window.print();
  }

  ngOnDestroy(): void {
    this.barChart.destroy();
  }
}
