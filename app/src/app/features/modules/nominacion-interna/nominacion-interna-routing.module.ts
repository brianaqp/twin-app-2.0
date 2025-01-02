import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NominacionInternaComponent } from './nominacion-interna.component';

const routes: Routes = [{ path: '', component: NominacionInternaComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NominacionInternaRoutingModule {}
