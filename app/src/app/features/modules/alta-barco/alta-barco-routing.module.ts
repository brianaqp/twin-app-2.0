import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AltaBarcoComponent } from './alta-barco.component';

const routes: Routes = [
  {
    path: '',
    component: AltaBarcoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AltaBarcoRoutingModule {}
