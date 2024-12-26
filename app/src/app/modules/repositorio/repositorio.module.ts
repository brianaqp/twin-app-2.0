import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepositorioComponent } from './repositorio.component';
import { RepositorioRoutingModule } from './repositorio-routing.module';
import { RepoVesselComponent } from './components/repo-vessel/repo-vessel.component';
import { RepoRegisterComponent } from './components/repo-register/repo-register.component';

@NgModule({
  declarations: [
    RepositorioComponent,
    RepoVesselComponent,
    RepoRegisterComponent,
  ],
  imports: [CommonModule, RepositorioRoutingModule],
})
export class RepositorioModule {}
