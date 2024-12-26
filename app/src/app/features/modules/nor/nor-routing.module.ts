import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NorComponent } from './nor.component';

const routes: Routes = [{ path: '', component: NorComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NorRoutingModule {}
