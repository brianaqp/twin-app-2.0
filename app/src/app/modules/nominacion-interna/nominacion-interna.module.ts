import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NominacionInternaComponent } from './nominacion-interna.component';
import { NominacionInternaRoutingModule } from './nominacion-interna-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [NominacionInternaComponent],
  imports: [
    CommonModule,
    NominacionInternaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbAlertModule,
  ],
})
export class NominacionInternaModule {}
