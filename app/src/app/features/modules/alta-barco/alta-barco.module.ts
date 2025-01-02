import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AltaBarcoComponent } from './alta-barco.component';
import { AltaBarcoRoutingModule } from './alta-barco-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [AltaBarcoComponent],
  imports: [
    CommonModule,
    AltaBarcoRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbAlertModule,
  ],
})
export class AltaBarcoModule {}
