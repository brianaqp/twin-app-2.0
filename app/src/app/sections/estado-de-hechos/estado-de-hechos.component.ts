import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgbPopover, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { HechosInlineStyles } from './hechosInline';
import { Recibidor, Register } from '../../interfaces/register';
import { Vessel } from '../../interfaces/vessel';
import { RepositoriesService } from '../../services/repositories.service';
import { CommonFunctionsService } from '../../services/common-functions.service';
import { TonFormatPipe } from 'src/app/pipes/ton-format.pipe';

@Component({
  selector: 'app-estado-de-hechos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbPopoverModule,
    DatePipe,
    TonFormatPipe,
  ],
  templateUrl: './estado-de-hechos.component.html',
  styleUrls: ['./estado-de-hechos.component.scss'],
})
export class EstadoDeHechosComponent implements OnInit {
  // Vienen con el routerData
  workingPort!: string;
  registerId!: any;
  //
  filteredDates!: string[];
  localTimes!: any;
  form!: FormGroup;
  showPrintPreview: boolean = false;
  register!: Register;
  vessel!: Vessel;
  isDataLoaded: boolean = false;
  receiversInfo: any;
  blInfo: any;
  hechosData!: any;
  filteredTimes!: any;
  signaturesForm!: FormGroup;
  // Styles variables for inline email
  st: any = new HechosInlineStyles();
  @ViewChild('copy_popover') copyPopover!: NgbPopover;

  constructor(
    private router: Router,
    private readonly repoSvc: RepositoriesService,
    private readonly fb: FormBuilder,
    private readonly cmnSvc: CommonFunctionsService,
  ) {
    const routerData: any = router.getCurrentNavigation()?.extras.state;
    this.registerId = routerData.registerId;
    this.workingPort = routerData.workingPort;
  }

  // Metodo que recibiendo multiples objetos, retorna una combinacion de todos ellos
  getMergedStyles(...objects: any): any {
    return Object.assign({}, ...objects);
  }

  get flowType(): string {
    return this.cmnSvc.getFlowType(this.register.flow);
  }

  ngOnInit(): void {
    this.repoSvc.findOne('registers', this.registerId).subscribe((res) => {
      this.register = res;
      this.repoSvc
        .findOne('vessels', this.register.vesselId)
        .subscribe((res) => {
          this.vessel = res;
          this.initForm();
          this.setVariables();
          this.isDataLoaded = true;
          this.orderTimes();
        });
    });
  }

  initForm(): void {
    // times forms
    this.form = this.fb.group(this.register.reports[this.workingPort].times);
    // signatures form
    this.signaturesForm = this.fb.group({
      boxes: this.fb.array([]),
    });
  }

  setVariables(): void {
    this.localTimes = this.register.reports[this.workingPort].times;
    // filter dates
    let dates = Object.keys(this.localTimes);
    this.filteredDates = dates.sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });
    //
    this.hechosData = this.register.reports[this.workingPort].data;
    this.blInfo = Object.entries(
      this.register.reports[this.workingPort].data.blData.data,
    );
    // boxes
    const boxes = this.register.reports[this.workingPort].data.signatures;
    if (boxes !== undefined && boxes.length > 0) {
      boxes.forEach((box: any) => {
        this.addSignBox();
      });
      (this.signaturesForm.get('boxes') as FormArray).patchValue(boxes);
    }
    //
    this.setReceiversData();
  }

  get signatureBoxes(): FormArray {
    return this.signaturesForm.get('boxes') as FormArray;
  }

  setReceiversData(): void {
    const rawData =
      this.register.reports[this.workingPort].data.receiversData.receivers;
    let data: object[] = [];
    rawData.forEach((item: Recibidor) => {
      data.push({
        name: item.name,
        tonelaje: item.tonelaje,
        razonSocial: item.tonelaje,
      });
    });
    // Agrupacion por categoria
    const tonelajePorNombre: any = {};
    data.forEach((item: any) => {
      if (tonelajePorNombre[item.name]) {
        tonelajePorNombre[item.name] += this.cmnSvc.convertStringToFloat(
          item.tonelaje,
        );
      } else {
        tonelajePorNombre[item.name] = this.cmnSvc.convertStringToFloat(
          item.tonelaje,
        );
      }
    });
    // asignacion a variable final (tambien anade razon social)
    this.receiversInfo = Object.keys(tonelajePorNombre).map((name) => {
      const sameObj = this.hechosData.receiversData.receivers.find(
        (item: any) => {
          return item.name === name;
        },
      );
      return {
        name,
        tonelaje: tonelajePorNombre[name].toLocaleString('en-US', {
          minimumFractionDigits: 3,
          maximumFractionDigits: 3,
        }),
        razonSocial: sameObj.razonSocial,
        id: sameObj.id,
      };
    });
  }

  getBlData(id: string, category: string): string {
    console.log(this.hechosData.blData.data);
    let value = '';
    this.hechosData.blData.data.map((item: any, index: number) => {
      if (item.id === id) {
        value = this.hechosData.blData.data[index][category];
        return;
      }
    });
    return value;
  }

  checkIfCategoryExist(date: string, category: string): any {
    const timesCount = Object.keys(this.localTimes[date][category]).length;
    return Boolean(timesCount);
  }

  orderTimes(): void {
    let allTimes: any = [];
    let temp: any = [];
    for (let date of Object.keys(this.localTimes)) {
      for (let category of Object.entries(this.localTimes[date])) {
        temp = temp.concat(category[1]);
      }
      allTimes[date] = temp;
      temp = [];
    }
    this.filteredTimes = this.filterTimes(allTimes);
  }

  filterTimes(times: any): any {
    let orderedTimes: any = [];
    for (let date of Object.keys(times)) {
      orderedTimes[date] = times[date].sort((a: any, b: any) => {
        return a.startTime.localeCompare(b.startTime, undefined, {
          numeric: true,
        });
      });
    }
    return orderedTimes;
  }

  getCategoryFormatted(category: string): string {
    // Se separa por Palabras
    const words = category.split(/(?=[A-Z])/);
    // Se capitaliza la primera
    const newWords = words.map((elemento: string) => {
      return elemento.charAt(0).toUpperCase() + elemento.slice(1).toLowerCase();
    });
    // Juntar las dos palabras
    return newWords.join(' ');
  }

  // Metodo que anade un nuevo elemento a la lista de tiempos
  addSignBox(): void {
    const boxes = this.signaturesForm.get('boxes') as FormArray;
    boxes.push(
      this.fb.group({
        name: '',
        role: '',
      }),
    );
  }

  // Metodo que borra el ultimo elemento del formArray
  removeSignBox() {
    const boxes = this.signaturesForm.get('boxes') as FormArray;
    boxes.removeAt(boxes.length - 1);
  }

  pdf(): void {
    window.print();
  }

  /// Metodo que retorna las cajas en grupos de 2
  get allBoxes(): any {
    // Getter que retorna las cajas en grupos de 2
    const rowLimit = 2;
    const rawBoxes = [
      ...this.receiversInfo.map((item: any) => ({
        name: item['name'],
        role: 'As Cargo Receiver',
      })),
      ...this.signaturesForm.get('boxes')?.value,
    ];
    const boxesInRows: any[] = [];

    for (let i = 0; i < rawBoxes.length; i += rowLimit) {
      boxesInRows.push(rawBoxes.slice(i, i + rowLimit));
    }

    return boxesInRows;
  }

  // Funcion que guarda los datos del formulario en la base de datos
  onSubmit(): void {
    // copy of register
    const register = { ...this.register };
    const data = this.signaturesForm.get('boxes')?.value;
    // setting data
    register.reports[this.workingPort].data.signatures = data;
    this.repoSvc.updateOne('registers', this.register).subscribe((res) => {
      this.showPopover(res.acknowledged);
    });
  }

  // Metodo que muestra un popover con el mensaje de guardado
  showPopover(response: boolean): void {
    if (response) {
      this.copyPopover.ngbPopover = 'Datos guardados con exito';
    } else {
      this.copyPopover.ngbPopover = 'Hubo un error al guardar los datos.';
    }
    this.copyPopover.open();
    this.delay(2500, () => this.copyPopover.close());
  }

  async delay(ms: number, func: any): Promise<void> {
    setTimeout(func, ms);
  }

  changePreview(): void {
    this.showPrintPreview = !this.showPrintPreview;
    console.log(this.showPrintPreview);
  }
}
