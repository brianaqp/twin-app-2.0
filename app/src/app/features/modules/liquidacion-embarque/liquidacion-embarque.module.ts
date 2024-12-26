import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LiquidacionEmbarqueComponent } from './liquidacion-embarque.component';
import { LiquidacionEmbarqueRoutingModule } from './liquidacion-embarque-routing.module';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [LiquidacionEmbarqueComponent],
  imports: [CommonModule, LiquidacionEmbarqueRoutingModule, SharedModule],
  providers: [CommonFunctionsService, DatePipe],
})
export class LiquidacionEmbarqueModule {}
