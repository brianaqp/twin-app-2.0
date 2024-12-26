import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { NorComponent } from './nor.component';
import { NorRoutingModule } from './nor-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';

@NgModule({
  declarations: [NorComponent],
  imports: [CommonModule, NorRoutingModule, FormsModule, ReactiveFormsModule],
  providers: [CommonFunctionsService, DatePipe],
})
export class NorModule {}
