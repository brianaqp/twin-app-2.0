import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DistribucionEmbarqueComponent } from './distribucion-embarque.component';
import { DistribucionEmbarqueRoutingModule } from './distribucion-embarque-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { CommonFunctionsService } from '../../services/common-functions.service';

@NgModule({
  declarations: [DistribucionEmbarqueComponent],
  imports: [
    CommonModule,
    DistribucionEmbarqueRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  providers: [CommonFunctionsService, DatePipe],
})
export class DistribucionEmbarqueModule {}
