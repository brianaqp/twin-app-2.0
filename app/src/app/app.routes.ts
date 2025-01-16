import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RepositorioComponent } from './sections/repositorio/repositorio.component';
import ReporteDeLlegadaComponent from './sections/reporte-de-llegada/reporte-de-llegada.component';
import { NuevoRegistroComponent } from './sections/nuevo-registro/nuevo-registro.component';
import { AltaBarcoComponent } from './sections/alta-barco/alta-barco.component';
import { LiquidacionEmbarqueComponent } from './sections/liquidacion-embarque/liquidacion-embarque.component';
import { DistribucionEmbarqueComponent } from './sections/distribucion-embarque/distribucion-embarque.component';
import { NominacionInternaComponent } from './sections/nominacion-interna/nominacion-interna.component';
import { GaleriaComponent } from './sections/galeria/galeria.component';
import { KpiComponent } from './sections/kpi/kpi.component';
import { UtilitiesComponent } from './sections/utilities/utilities.component';
import { OperacionesComponent } from './sections/operaciones/operaciones.component';
import { EstadoDeHechosComponent } from './sections/estado-de-hechos/estado-de-hechos.component';
import { NorComponent } from './sections/nor/nor.component';
import { ReportePorHorasComponent } from './sections/reporte-por-horas/reporte-por-horas.component';
import { LoginComponent } from './sections/login/login.component';
import { NotAuthComponent } from './sections/not-auth/not-auth.component';


export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'not-auth',
    component: NotAuthComponent,
  },
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'repositorio',
    component: RepositorioComponent,
  },
  {
    path: 'reporte-de-llegada',
    component: ReporteDeLlegadaComponent,
  },
  {
    path: 'alta-barco',
    component: AltaBarcoComponent,
  },
  {
    path: 'nuevo-registro',
    component: NuevoRegistroComponent,
  },
  {
    path: 'distribucion-embarque',
    component: DistribucionEmbarqueComponent,
  },
  {
    path: 'nominacion-interna',
    component: NominacionInternaComponent,
  },
  {
    path: 'liquidacion-embarque',
    component: LiquidacionEmbarqueComponent,
  },
  {
    path: 'galeria',
    component: GaleriaComponent,
  },
  {
    path: 'kpi',
    component: KpiComponent,
  },
  {
    path: 'utilities',
    component: UtilitiesComponent,
  },
  {
    path: 'reporte-de-operaciones',
    component: OperacionesComponent,
  },
  {
    path: 'estado-de-hechos',
    component: EstadoDeHechosComponent,
  },
  {
    path: 'nor',
    component: NorComponent,
  },
  {
    path: 'reporte-por-horas',
    component: ReportePorHorasComponent,
  },
];
