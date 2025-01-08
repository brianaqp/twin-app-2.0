import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RepositorioComponent } from './sections/repositorio/repositorio.component';
import ReporteDeLlegadaComponent from './sections/reporte-de-llegada/reporte-de-llegada.component';

export const routes: Routes = [
  // Fully working path
  {
    path: '',
    component: HomeComponent,
  },
  // Testing paths
  {
    path: 'repositorio',
    component: RepositorioComponent,
  },
  {
    path: 'reporte-de-llegada',
    component: ReporteDeLlegadaComponent,
  },
  // Not implemented paths
  // 1. Repositorios
  // {
  //   path: 'alta-barco',
  //   loadChildren: () =>
  //     import('./modules/alta-barco/alta-barco.module').then(
  //       (m) => m.AltaBarcoModule
  //     ),
  // },
  // {
  //   path: 'nuevo-registro',
  //   loadChildren: () =>
  //     import('./modules/nuevo-registro/nuevo-registro.module').then(
  //       (m) => m.NuevoRegistroModule
  //     ),
  // },
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
  //   path: 'nominacion-interna',
  //   loadChildren: () =>
  //     import('./modules/nominacion-interna/nominacion-interna.module').then(
  //       (m) => m.NominacionInternaModule
  //     ),
  // },
  // {
  //   path: 'liquidacion-embarque',
  //   loadChildren: () =>
  //     import('./modules/liquidacion-embarque/liquidacion-embarque.module').then(
  //       (m) => m.LiquidacionEmbarqueModule
  //     ),
  // },
  // {
  //   path: 'distribucion-embarque',
  //   loadChildren: () =>
  //     import(
  //       './modules/distribucion-embarque/distribucion-embarque.module'
  //     ).then((m) => m.DistribucionEmbarqueModule),
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
