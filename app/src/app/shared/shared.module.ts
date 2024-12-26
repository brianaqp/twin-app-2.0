// shared.module.ts
import { NgModule } from '@angular/core';
import { TonFormatPipe } from '../pipes/ton-format.pipe';

@NgModule({
  declarations: [TonFormatPipe],
  imports: [],
  exports: [TonFormatPipe],
})
export class SharedModule {}
