import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import ReporteDeLlegadaComponent from './reporte-de-llegada.component';

const routes: Routes = [
  {
    path: '',
    component: ReporteDeLlegadaComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReporteDeLlegadaRoutingModule {}
