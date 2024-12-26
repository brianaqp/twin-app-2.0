import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GaleriaComponent } from './galeria.component';
import { GaleriaRoutingModule } from './galeria-routing.module';
import { MongoBucketService } from 'src/app/services/mongo-bucket.service';
import { NgbAlertModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CatService } from 'src/app/test/cat.service';

@NgModule({
  declarations: [GaleriaComponent],
  imports: [
    CommonModule,
    FormsModule,
    GaleriaRoutingModule,
    NgbPopoverModule,
    NgbAlertModule,
  ],
  providers: [MongoBucketService, CatService],
})
export class GaleriaModule {}
