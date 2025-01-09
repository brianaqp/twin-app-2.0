import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  HoldCargos,
  QuantitieTtl,
  Quantities,
  Register,
  TimesObject,
} from 'src/app/interfaces/register';
import { Vessel } from 'src/app/interfaces/vessel';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { RepositoriesService } from 'src/app/services/repositories.service';
import { horasInline } from './horasInline';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TonFormatPipe } from 'src/app/pipes/ton-format.pipe';

@Component({
  selector: 'app-reporte-por-horas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TonFormatPipe,
    DatePipe
  ],
  templateUrl: './reporte-por-horas.component.html',
  styleUrls: ['./reporte-por-horas.component.scss'],
})
export class ReportePorHorasComponent implements OnInit {
  registerId!: string;
  registerData!: Register;
  vesselData!: Vessel;
  workingDates!: string[];
  workingPort!: string;
  isDataLoaded: boolean = false;
  localTimes: any = {};
  timesPerDate: any = {};
  holdCargos!: HoldCargos[];
  manualTable!: QuantitieTtl;
  localQuantities!: Quantities;
  ttl!: QuantitieTtl;
  date: string = '0';
  routerDate: any;
  showTables: boolean = false;
  showGeneralQtt: boolean = false;
  hoursLimit: string = '24:00';
  st = horasInline;

  gms(...args: any): { [key: string]: string } {
    return Object.assign({}, ...args);
  }

  constructor(
    private readonly router: Router,
    private readonly repoSvc: RepositoriesService,
    private readonly cmnSvc: CommonFunctionsService
  ) {
    const routerData: any = this.router.getCurrentNavigation()?.extras.state;
    this.registerId = routerData.registerId;
    this.workingPort = routerData.port;
    this.routerDate = routerData.date;
  }

  // --- Init Methods
  ngOnInit(): void {
    try {
      this.pullData().then(() => {
        this.initVariables();
        this.isDataLoaded = true;
      });
    } finally {
    }
  }

  async pullData(): Promise<void> {
    const registerProjection = {
      vesselId: 1,
      flow: 1,
      reports: 1,
    };
    const vesselProjection = {
      'shipParticulars.name': 1,
    };
    this.registerData = await firstValueFrom(
      this.repoSvc.findOne('registers', this.registerId, registerProjection)
    );
    this.vesselData = await firstValueFrom(
      this.repoSvc.findOne(
        'vessels',
        this.registerData.vesselId,
        vesselProjection
      )
    );
  }

  initVariables(): void {
    // Times
    this.localTimes = this.registerData.reports[this.workingPort].times;
    delete this.localTimes['undefined'];
    // Quantities
    this.localQuantities =
      this.registerData.reports[this.workingPort].quantities;
    // Dates
    this.workingDates = Object.keys(this.localTimes);
    // Show General Quantities
    this.showGeneralQtt =
      this.registerData.reports[this.workingPort].data.showGeneralQtt;
    // add date if exist
    if (this.routerDate !== undefined) {
      this.date = this.routerDate;
      this.onDateChange();
    }
    // Manual Table
    this.manualTable =
      this.registerData.reports[this.workingPort].data.manualTable;
    if (this.manualTable === undefined) {
      this.manualTable = {
        initialTon: '0',
        previous: '0',
        perDay: '0',
        ttl: '0',
        toBeDischarge: '0',
      };
    }
    // Holds Cargos
    this.holdCargos = this.registerData.reports[this.workingPort].holdCargos;
    if (this.holdCargos === undefined) {
      this.holdCargos = [];
    }
  }

  // --- Changes Methods
  onDateChange(): void {
    if (this.workingDates.includes(this.date)) {
      this.showTables = true;
      // 1. Cambiar los valores totales a los de ese dia. (checar si esta bien)
      this.ttl = this.localQuantities[this.date]['general'];
      // 2. Actualizar tiempos por dia y tratar la data
      this.updateTimes();
    } else {
      this.showTables = false;
      this.clearCompoment();
    }
  }

  // Metodos para setear el limite de horas (14,16) con el nombre set24report
  set16Report(): void {
    this.changeHoursLimit('16:00');
  }

  set24Report(): void {
    this.changeHoursLimit('24:00');
  }

  changeHoursLimit(hour: string) {
    if (this.hoursLimit != hour) {
      this.hoursLimit = hour;
      if (this.workingDates.includes(this.date)) {
        this.showTables = true;
        this.updateTimes();
      } else {
        this.showTables = false;
        this.clearCompoment();
      }
    }
  }

  clearCompoment(): void {
    this.timesPerDate = {};
    this.ttl = {
      initialTon: '',
      previous: '',
      perDay: '',
      ttl: '',
      toBeDischarge: '',
    };
  }

  // --- Functionality methods
  // Funcion que actualiza los tiempos visibles.
  updateTimes(): void {
    this.timesPerDate = {}; // Limpiar el componente
    this.timesPerDate[this.date] = {}; // Se inicializa en esta fecha
    // Por cada categoria
    for (let category of ['operationalTimes', 'stopTimes']) {
      // Evaluando los casos de 16 y 24 horas
      if (this.hoursLimit === '16:00') {
        this.timesPerDate[this.date][category] = this.getFilteredTimes(
          category,
          '08:00',
          '16:00',
          this.date
        );
      }
      if (this.hoursLimit === '24:00') {
        // Previous day
        // En el caso de ser un reporte de 24 horas, se debe de agregar los tiempos del dia anterior
        const index = this.workingDates.indexOf(this.date);

        // Si existe una fecha anterior
        if (index - 1 >= 0) {
          const previousDate = this.workingDates[index - 1];
          this.timesPerDate[previousDate] = {}; // Se inicializa la fecha
          for (let category of ['operationalTimes', 'stopTimes']) {
            this.timesPerDate[previousDate][category] = this.getFilteredTimes(
              category,
              '08:00',
              '24:00',
              previousDate
            );
          }
        }
        // This day
        this.timesPerDate[this.date][category] = this.getFilteredTimes(
          category,
          '00:00',
          '08:00',
          this.date
        );
      }
    }
  }

  getFilteredTimes(
    category: string,
    minHour: string,
    maxHour: string,
    date: string
  ): any {
    // Funcion que ordena los tiempos cronologimente desde las 08:00 hasta la hora limite.
    const rawData: TimesObject[] = this.localTimes[date][category];

    // Filtro desde las 08:00 hasta la hora limite
    const filteredData = rawData.filter((time) => {
      return time.startTime >= minHour && time.startTime <= maxHour;
    });

    // Se retorna los tiempos ordenados cronologicamente
    return filteredData.sort((a, b) => {
      if (a.startTime < b.startTime) {
        return -1;
      }
      if (a.startTime > b.startTime) {
        return 1;
      }
      return 0;
    });
  }

  // --- DOM METHODS
  get flowName(): string {
    return this.cmnSvc.getFlowString(this.registerData.flow);
  }

  getFlowType(category: string): string {
    return category === 'receivers'
      ? this.cmnSvc.getFlowType(this.registerData.flow)
      : this.capitalizeFirstLetter(category);
  }

  capitalizeFirstLetter(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  get orderedDates(): string[] {
    return this.workingDates.sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });
  }

  getTitle(): string {
    return this.hoursLimit.slice(0, 2);
  }

  // Metodo que retorna las fechas de los tiempos en reversa, para que se muestren en orden cronologico.
  get getDatesOfTimes(): Array<string> {
    return Object.keys(this.timesPerDate).reverse();
  }

  getCategoryFormatted(category: string): string {
    // Se separa por Palabras
    const words = category.split(/(?=[A-Z])/);
    // Se capitaliza la primera palabra y se convierten las demas en minusculas
    const newWords = words.map((elemento: string, index) => {
      if (index === 0) {
        return elemento.charAt(0).toUpperCase() + elemento.slice(1);
      } else {
        return elemento.toLocaleLowerCase();
      }
    });
    // Juntar las dos palabras
    return newWords.join(' ');
  }

  // Metodo que comprueba si hay cantidades para mostrar, y retorna un booleano para mostrar o no la tabla.
  checkIfCategoryShow(category: String): boolean {
    if (category === 'receivers') {
      return this.registerData.reports[this.workingPort].data.showReceiversQtt;
    } else if (category === 'products') {
      return this.registerData.reports[this.workingPort].data.showProductsQtt;
    } else if (category === 'holds') {
      return this.registerData.reports[this.workingPort].data.showHoldsQtt;
    } else {
      return false;
    }
  }

  // Metodo que comprueba si hay tiempos para mostrar, y retorna un booleano para mostrar o no la tabla.
  checkIfTimesShow(times: object[]): boolean {
    return times.length > 0;
  }

  get formattedDate() {
    if (this.date !== null && this.workingDates.includes(this.date)) {
      return this.date;
    } else {
      return '';
    }
  }

  pdf(): void {
    window.print();
  }
}
