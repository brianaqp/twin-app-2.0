import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import PublicComponent from './public.component';
import { PublicRoutingModule } from './public-routing.module';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';

@NgModule({
  declarations: [PublicComponent],
  imports: [CommonModule, PublicRoutingModule],
  providers: [CommonFunctionsService, DatePipe],
})
export class PublicModule {}
