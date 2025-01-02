import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiComponent } from './kpi.component';
import { KpiRoutingModule } from './kpi-routing.module';

@NgModule({
  declarations: [KpiComponent],
  imports: [CommonModule, KpiRoutingModule],
})
export class KpiModule {}
