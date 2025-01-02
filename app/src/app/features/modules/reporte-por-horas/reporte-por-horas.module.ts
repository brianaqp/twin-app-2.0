import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportePorHorasComponent } from './reporte-por-horas.component';
import { ReportePorHorasRoutingModule } from './reporte-por-horas.routing.module';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [ReportePorHorasComponent],
  imports: [
    CommonModule,
    ReportePorHorasRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  providers: [DatePipe, CommonFunctionsService],
})
export class ReportePorHorasModule {}
