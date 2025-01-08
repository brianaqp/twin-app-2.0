import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RepositorioComponent } from './sections/repositorio/repositorio.component';
import ReporteDeLlegadaComponent from './sections/reporte-de-llegada/reporte-de-llegada.component';
import { NuevoRegistroComponent } from './sections/nuevo-registro/nuevo-registro.component';
import { AltaBarcoComponent } from './sections/alta-barco/alta-barco.component';
import { LiquidacionEmbarqueComponent } from './sections/liquidacion-embarque/liquidacion-embarque.component';
import { DistribucionEmbarqueComponent } from './sections/distribucion-embarque/distribucion-embarque.component';
import { NominacionInternaComponent } from './sections/nominacion-interna/nominacion-interna.component';

export const routes: Routes = [
  // Fully working path
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'reporte-de-llegada',
    component: ReporteDeLlegadaComponent,
  },
  {
    path: 'alta-barco',
    component: AltaBarcoComponent
  },
  {
    path: 'repositorio',
    component: RepositorioComponent,
  },
  {
    path: 'nuevo-registro',
    component: NuevoRegistroComponent,
  },
  // Documents inside RepoVessel
  {
    path: 'distribucion-embarque',
    component: DistribucionEmbarqueComponent
  },
  {
    path: 'nominacion-interna',
    component: NominacionInternaComponent
  },
  {
    path: 'liquidacion-embarque',
    component: LiquidacionEmbarqueComponent
  },
  
  // Not implemented paths
  // 1. Repositorios
  // {
  //   path: 'reporte-de-operaciones',
  //   loadChildren: () =>
  //     import('./modules/operaciones/operaciones.module').then(
  //       (m) => m.ReporteDeOperacionesModule
  //     ),
  // },
  // {
  //   path: 'estado-de-hechos',
  //   loadChildren: () =>
  //     import('./modules/estado-de-hechos/estado-de-hechos.module').then(
  //       (m) => m.EstadoDeHechosModule
  //     ),
  // },
  // {
  //   path: 'nor',
  //   loadChildren: () =>
  //     import('./modules/nor/nor.module').then((m) => m.NorModule),
  // },
  // {
  //   path: 'reporte-por-horas',
  //   loadChildren: () =>
  //     import('./modules/reporte-por-horas/reporte-por-horas.module').then(
  //       (m) => m.ReportePorHorasModule
  //     ),
  // },
  // {
  //   path: 'galeria',
  //   loadChildren: () =>
  //     import('./modules/galeria/galeria.module').then((m) => m.GaleriaModule),
  // },
  // {
  //   path: 'kpi',
  //   loadChildren: () =>
  //     import('./modules/kpi/kpi.module').then((m) => m.KpiModule),
  // },
  // {
  //   path: 'utilities',
  //   loadChildren: () =>
  //     import('./modules/utilities/utilities.module').then(
  //       (m) => m.UtilitiesModule
  //     ),
  // },
];
