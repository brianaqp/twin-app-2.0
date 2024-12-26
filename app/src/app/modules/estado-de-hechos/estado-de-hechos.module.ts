import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { EstadoDeHechosComponent } from './estado-de-hechos.component';
import { EstadoDeHechosRoutingModule } from './estado-de-hecho.routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonFunctionsService } from '../../services/common-functions.service';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [EstadoDeHechosComponent],
  imports: [
    CommonModule,
    EstadoDeHechosRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbPopoverModule,
    SharedModule,
  ],
  providers: [CommonFunctionsService, DatePipe],
})
export class EstadoDeHechosModule {}
