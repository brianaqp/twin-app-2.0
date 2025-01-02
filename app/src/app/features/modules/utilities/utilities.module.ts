import { NgModule } from '@angular/core';
import { UtilitiesComponent } from './utilities.component';
import { CommonModule } from '@angular/common';
import { UtilitiesRoutingModule } from './utilities.routing.module';
import { FormsModule } from '@angular/forms';
import { FilesService } from '../../services/files.service';

@NgModule({
  declarations: [UtilitiesComponent],
  imports: [CommonModule, FormsModule, UtilitiesRoutingModule],
  providers: [FilesService],
})
export class UtilitiesModule {}
