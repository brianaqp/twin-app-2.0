import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DistribucionEmbarqueComponent } from './distribucion-embarque.component';

const routes: Routes = [
  {
    path: '',
    component: DistribucionEmbarqueComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DistribucionEmbarqueRoutingModule {}
