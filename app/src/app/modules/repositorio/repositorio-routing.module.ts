import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RepositorioComponent } from './repositorio.component';

const routes: Routes = [
  {
    path: '',
    component: RepositorioComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RepositorioRoutingModule {}
