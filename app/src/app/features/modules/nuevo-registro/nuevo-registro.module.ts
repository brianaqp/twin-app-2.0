import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { NuevoRegistroRoutingModule } from './nuevo-registro-routing.module';
import { NuevoRegistroComponent } from './nuevo-registro.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VesselCardComponent } from './components/vessel-card.component';
import { NgbAlertModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { RepositoriesService } from '../../services/repositories.service';
import { CommonFunctionsService } from '../../services/common-functions.service';

@NgModule({
  declarations: [NuevoRegistroComponent, VesselCardComponent],
  imports: [
    CommonModule,
    NuevoRegistroRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgbAlertModule,
    NgbDropdownModule,
  ],
  providers: [RepositoriesService, CommonFunctionsService, DatePipe],
})
export class NuevoRegistroModule {}
