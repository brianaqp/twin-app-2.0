import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EstadoDeHechosComponent } from './estado-de-hechos.component';

const routes: Routes = [
  {
    path: '',
    component: EstadoDeHechosComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EstadoDeHechosRoutingModule {}
