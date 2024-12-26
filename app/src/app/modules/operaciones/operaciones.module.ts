import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OperacionesComponent } from './operaciones.component';
import { OperacionesRoutingModule } from './operaciones-routing.module';
import { TimesComponent } from './components/times/times.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { QuantitiesComponent } from './components/quantities/quantities.component';
import { ManualTableComponent } from './components/manual-table/manual-table.component';
import {
  NgbAlertModule,
  NgbCollapseModule,
  NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    OperacionesComponent,
    TimesComponent,
    QuantitiesComponent,
    ManualTableComponent,
  ],
  imports: [
    CommonModule,
    OperacionesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbCollapseModule,
    NgbAlertModule,
    NgbDropdownModule,
  ],
  providers: [CommonFunctionsService, DatePipe],
})
export class ReporteDeOperacionesModule {}
