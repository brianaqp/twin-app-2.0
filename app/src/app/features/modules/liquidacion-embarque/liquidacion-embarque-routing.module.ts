import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LiquidacionEmbarqueComponent } from './liquidacion-embarque.component';

const routes: Routes = [{ path: '', component: LiquidacionEmbarqueComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LiquidacionEmbarqueRoutingModule {}
