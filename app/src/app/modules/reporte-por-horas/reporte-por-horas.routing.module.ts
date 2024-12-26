import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportePorHorasComponent } from './reporte-por-horas.component';

const routes: Routes = [
  {
    path: '',
    component: ReportePorHorasComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportePorHorasRoutingModule {}
