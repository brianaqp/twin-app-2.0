import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NuevoRegistroComponent } from './nuevo-registro.component';

const routes: Routes = [
  {
    path: '',
    component: NuevoRegistroComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NuevoRegistroRoutingModule {}
