import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  AfterViewInit,
} from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { firstValueFrom, tap } from 'rxjs';
import { VesselCardComponent } from './components/vessel-card.component';
import { Router } from '@angular/router';
import { NgbAlert, NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { InsertOneResult, UpdateResult } from 'mongodb';
import { Ports } from '../../environments/globals';
import { Register } from '../../interfaces/register';
import { RepositoriesService } from '../../services/repositories.service';
import { CommonFunctionsService } from '../../services/common-functions.service';
import { ApiError } from '../../interfaces/api-error';
import { Vessel } from '../../interfaces/vessel';

@Component({
  selector: 'app-nuevo-registro',
  templateUrl: './nuevo-registro.component.html',
  styleUrls: ['./nuevo-registro.component.scss'],
})
export class NuevoRegistroComponent implements OnInit {
  // Dom
  // -- Autocomplete variables
  autoCompleteData: string[] = [];
  autoCompleteDataFiltered: string[] = [];
  @ViewChild('companieDropdown') companieDropdown!: NgbDropdown;
  // Variables importantes
  routerData!: any;
  registerId!: string;
  oldVesselId!: string;
  vesselsList: any[] = [];
  portsList = [...Ports];
  workingPorts: string[] = [];
  localRegister!: Register;
  roleList = ['Armador', 'Trader', 'Recibidor', 'A.A', 'Otros'];
  // Valores iniciales
  flow!: FormControl;
  registersCounts!: number;
  vesselTrips!: FormControl;
  loadingPort!: FormControl;
  totalShipment!: FormControl;
  cargo!: FormControl;
  // form values
  registerForm!: FormGroup;
  portCalls!: FormArray;
  stowagePlan!: FormArray;
  calados!: FormArray;
  // Destinatarios
  destinatarios!: FormArray;
  @Input() companie!: string;
  @Input() names!: string;
  // view child
  @ViewChild('role', { static: false }) role!: ElementRef;
  @ViewChild(VesselCardComponent) vesselComponent!: VesselCardComponent;
  @ViewChild('submitButton') submitButton!: ElementRef;
  // flags
  editMode: boolean = false;
  registerExist: boolean = false;
  registerInserted: boolean = false;
  // Save alert
  saveAlertType: string = '';
  saveAlertMessage: string = '';
  @ViewChild('saveAlert') saveAlert!: NgbAlert;

  constructor(
    private readonly fb: FormBuilder,
    private readonly repoSvc: RepositoriesService,
    private router: Router,
    private cmnSvc: CommonFunctionsService
  ) {
    this.routerData = router.getCurrentNavigation()?.extras.state;
  }

  ngOnInit(): void {
    this.initVariables();
    this.initForm();
    this.setFormGetters();
    // Se obtienen los datos de la base de datos
    this.pullData('vessels').then(() => {
      this.editMode ? this.onEditMode() : null;
      // load dropdown data
      this.loadDropdownData();
    });
  }

  onEditMode(): void {
    // Funcion que ejecuta las configuraciones del modo edicion
    if (this.registerId != undefined) {
      this.pullRegisterData().then(() => {
        this.initEditVariables();
        this.patchFormWithRegister();
      });
    }
  }
  initEditVariables() {
    // Declara las variables de edicion
    this.registerExist = true;
    this.oldVesselId = this.localRegister.vesselId;
  }

  async pullRegisterData(): Promise<void> {
    // Funcion que obtiene los datos del registro
    this.registerId;
    const projection = {
      _id: 0,
    };
    this.localRegister = await firstValueFrom(
      this.repoSvc.findOne('registers', this.registerId)
    );
  }

  // load dropdown data
  async loadDropdownData(): Promise<void> {
    this.repoSvc
      .getDistinctField('registers', 'destinatarios_companie')
      .subscribe((res: string[]) => {
        this.autoCompleteData = [...res];
      });
  }

  // Función que iniciliaza las variables
  initVariables(): void {
    this.editMode = this.routerData.editMode;
    this.registerId = this.routerData.registerId;
  }

  initForm(): void {
    // Funcion que inicializa el formulario
    this.registerForm = this.fb.group({
      flow: [''],
      vesselTrips: [''],
      loadingPort: [''],
      totalShipment: [''],
      cargo: [''],
      portCalls: new FormArray([]),
      stowagePlan: new FormGroup({
        data: new FormArray([]),
        totales: new FormGroup({
          general: new FormControl(),
        }),
      }),
      calados: new FormArray([]),
      destinatarios: new FormArray([]),
    });
  }

  async pullData(collection: string): Promise<void> {
    // Funcion que obtiene los datos de la base de datos
    const projection = {
      _id: 0,
      id: 1,
      'shipParticulars.name': 1,
      registers: 1,
    };
    this.vesselsList = await firstValueFrom(
      this.repoSvc.find(collection, projection)
    );
    this.getRegistersCount();
  }

  async getRegistersCount(): Promise<void> {
    // Funcion que retorna un conteo de los registros
    const data = await firstValueFrom(
      this.repoSvc.getLatestRegisterCount('registers')
    );
    if (data !== null) {
      // use a 001 format
      this.registersCounts = data.registerCount + 1;
    } else {
      this.registersCounts = 1;
    }
  }

  setFormGetters(): void {
    // Funcion que inicializa los getters del formulario
    this.portCalls = this.registerForm.get('portCalls') as FormArray;
    this.stowagePlan = this.registerForm.get('stowagePlan.data') as FormArray;
    this.calados = this.registerForm.get('calados') as FormArray;
    this.destinatarios = this.registerForm.get('destinatarios') as FormArray;
  }

  // Stowage Plan Functions
  addHold(): void {
    const arr: any = {
      // formato basico
      hold: [this.stowagePlan.controls.length + 1],
      cargo: [''],
      general: [''],
    };
    // se añaden los puertos
    if (this.workingPorts.length > 0) {
      for (let port of this.workingPorts) {
        arr[port] = [''];
      }
    }
    // add new form control
    this.stowagePlan.push(this.fb.group(arr));
  }

  removeHold(): void {
    this.stowagePlan.removeAt(-1);
  }

  get isThereHolds(): boolean {
    return this.stowagePlan.controls.length > 0;
  }

  addPort(portSelected: string): void {
    // Funcion que agrega un puerto a sus diferentes formularios
    if (this.workingPorts.includes(portSelected) === false) {
      // 1. Se agrega a la lista de puertos trabajando
      this.workingPorts.push(portSelected);
      // 2. Se agrega a portCalls
      this.portCalls.push(
        this.fb.group({
          port: [portSelected],
          cantidad: [''],
        })
      );
      // 3. Se agrega a stowagePlan
      if (this.stowagePlan.controls.length > 0) {
        for (let control of this.stowagePlan.controls) {
          (control as FormGroup).addControl(portSelected, new FormControl(''));
        }
      }
      // 4. Se agrega a los totales de stowagePlan
      (this.registerForm.get('stowagePlan.totales') as FormGroup).addControl(
        portSelected,
        new FormControl('')
      );
      // 5. Se agrega a calados
      this.calados.push(
        this.fb.group({
          port: [portSelected],
          foreward: [''],
          afterward: [''],
        })
      );
    }
  }

  onDeletePort(port: string) {
    // Funcion que elimina un puerto de sus diferentes formularios
    // 1. Revisa que el puerto exista en los puertos trabajando
    if (this.workingPorts.includes(port)) {
      // 1. Se obtiene el index del puerto
      const index = this.workingPorts.indexOf(port);
      // 2. Se borra de los puertos trabajando
      this.workingPorts.splice(index, 1);
      // 3. Borrar de los formularios correspondientes
      this.portCalls.removeAt(index);
      this.calados.removeAt(index);
      for (let control of this.stowagePlan.controls) {
        (control as FormGroup).removeControl(port);
      }
      const totalescontrol = this.registerForm.get(
        'stowagePlan.totales'
      ) as FormGroup;
      totalescontrol.removeControl(port);
    }
  }

  addDestinatario(): void {
    this.destinatarios.push(
      this.fb.group({
        companie: [this.companie],
        names: [this.names],
        role: [this.role.nativeElement.value],
      })
    );
    // Anadir companie a la lista de autocompletado si no lo incluye, si companie no es undefined o en su defecto vacio.
    if (
      !this.autoCompleteData.includes(this.companie) &&
      this.companie !== undefined &&
      this.companie !== ''
    ) {
      this.autoCompleteData.push(this.companie.trim());
    }
    //
    this.companie = '';
    this.names = '';
    this.role.nativeElement.value = '0';
    this.reOrderDestinatarios();
  }

  onDeleteDestinatario(item: any) {
    // find index
    const index = this.destinatarios.controls.indexOf(item);
    // remove it from controls
    this.destinatarios.removeAt(index);
  }

  generateRegisterId(): string {
    // return format: yy-mm-#-name
    //PATCH
    const moment = DateTime.now();

    const month = moment.setLocale('es').toFormat('MMM');
    const year = moment.setLocale('es').toFormat('yy');
    // Vessel name
    const name = this.vesselComponent.selection.shipParticulars.name
      .split(' ')[0]
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '');
    // remove every character that can cause problems in http requests

    // get 000 format with the register count
    const count = this.registersCounts.toString().padStart(3, '0');
    //
    console.log(`${year}-${month}-${count}-${name}`);
    return `${year}-${month}-${count}-${name}`;
  }

  // Metodo que actualiza los totales de la categoria recibida de stowagePlan
  updateTotals(category: string): void {
    let total = 0;

    // Stowage Controls
    const stowageControls = this.registerForm.get(
      'stowagePlan.data'
    ) as FormArray;

    // Suma de los valores
    for (let control of stowageControls.controls) {
      const value = this.cmnSvc.convertStringToFloat(control.value[category]); // independiente de la cateogoria
      total += value;
    }

    // Total Control
    const totalesControl = this.registerForm.get(
      'stowagePlan.totales'
    ) as FormGroup;

    // Formateo de los totales
    const totalFormated = this.cmnSvc.getTonFormat(total);

    totalesControl.patchValue({ [category]: totalFormated });
  }

  clearForm(): void {
    this.portsList = [...Ports]; // to default
  }

  patchFormWithRegister(): void {
    // Funcion que setea los valores del formulario
    // 1. Se cambia el select del componente de vessels
    this.vesselComponent.selectFromEdit(this.oldVesselId);
    // atento errro aqui
    // this.clearForm(); // clean page
    // Working Ports
    for (let port of this.localRegister.workingPorts) {
      this.addPort(`${port}`);
    }
    for (let hold in this.localRegister.stowagePlan.data) {
      this.addHold();
    }
    for (let i in this.localRegister.destinatarios) {
      this.addDestinatario();
    }
    // primeras opciones
    this.registerForm.patchValue(this.localRegister);
    // // form arrays
  }

  getEditModeReport(): object {
    // Funcion que actualiza los puertos del registro existente en la base de datos
    // en caso de que se hayan modificado y lo retorna
    // -- Comparacion para actualizar los puertos sin que se destruyan
    // los tiempos.
    const oldPorts = this.localRegister.workingPorts;
    // Se revisan los nuevos puertos contra los viejos
    // 1. El puerto queda igual si existe en la lista vieja y actual.
    for (let newPort of this.workingPorts) {
      if (oldPorts.includes(newPort) === false) {
        // 2. El puerto se crea si existe en la nueva pero no en la vieja.
        this.localRegister.reports[newPort] = this.createReportObject();
      }
    }
    // 3. El puerto se borra si existe en la lista vieja pero ya no en la nueva.
    for (let oldPort of oldPorts) {
      if (this.workingPorts.includes(oldPort) === false) {
        delete this.localRegister.reports[oldPort];
      }
    }
    return { ...this.localRegister.reports };
  }

  createReportObject(): any {
    // Funcion que retorna un objeto de reporte vacio
    return {
      times: {},
      data: {
        receiversData: {
          receivers: [],
          total: '',
        },
        blData: {
          data: [],
          ttl: {
            weight: '',
            scale: '',
            diff: '',
          },
        },
        showTable: true,
        showGeneralQtt: true,
        showHoldsQtt: true,
        showProductsQtt: true,
        showReceiversQtt: true,
        generalRemarks: '',
        masterRemarks: '',
        norTendered: '',
        norPresented: '',
        products: [],
      },
      quantities: {},
    };
  }

  onSubmit(): void {
    // Funcion que guarda la informacion en la base de datos
    const vesselSelected: Vessel = this.vesselComponent.selection;
    // Variables
    let reportObj: any = {};
    // 2. Hacer los cambios si es registro editable
    if (this.editMode) {
      reportObj = this.getEditModeReport();
    } else {
      // Se crea el ID solo si es nuevo
      if (this.registerExist === false) {
        this.registerId = this.generateRegisterId();
      }
      // si no es editable, se crean los objetos de reporte desde cero
      for (let port of this.workingPorts) {
        reportObj[port] = this.createReportObject();
      }
    }
    // parche para el error del id incremental.
    let regCount;
    if (this.editMode) {
      regCount = this.localRegister.registerCount;
    } else {
      regCount = this.registersCounts;
    }

    // 3. Crear el objeto del registro
    const data: Register = {
      id: this.registerId,
      vesselId: vesselSelected.id,
      registerCount: regCount,
      ...this.registerForm.value,
      workingPorts: this.workingPorts,
      reports: reportObj,
      nominacionInterna: {},
    };

    // 4. Guardar el registro
    if (this.editMode) {
      this.repoSvc.updateOne('registers', data).subscribe({
        next: (res: UpdateResult) => {
          if (res.modifiedCount === 1) {
            this.showSaveAlert('success', 'Registro actualizado con exito');
          } else {
            this.showSaveAlert('secondary', 'No se modifico el registro.');
          }
        },
        error: (err: ApiError) => {
          this.showSaveAlert('danger', 'Error interno del servidor.');
        },
      });
      // en caso de insertar un nuevo registro
    } else {
      if (this.registerInserted) {
        this.showSaveAlert(
          'secondary',
          'Registro insertado. Favor de regresar a la lista de registros.'
        );
        return;
      }
      this.repoSvc.insertOne('registers', data).subscribe({
        next: (res: InsertOneResult) => {
          if (res.insertedId) {
            this.registerInserted = true;
            this.showSaveAlert('success', 'Registro insertado con exito');
            this.updateVessel(vesselSelected);
          } else {
            this.showSaveAlert('warning', 'No se inserto el documento.');
          }
        },
        error: (err: ApiError) => {
          this.showSaveAlert('danger', err.message);
        },
      });
    }
  }

  // Metodo que actualiza el campo registers de un vessel
  updateVessel(currVessel: Vessel): void {
    this.repoSvc
      .associeteRegisterWithVessel(currVessel.id, this.registerId)
      .subscribe({
        next: (res: UpdateResult) => {
          if (res.modifiedCount === 0) {
            this.showSaveAlert('secondary', 'No se modifico ningún valor.');
          }
        },
        error: (err: ApiError) => {
          this.showSaveAlert('danger', 'Error interno del servidor.');
        },
      });
  }

  // -------- Metodos del alert de guardado
  // Metodo que muesta un mensaje de exito o error
  showSaveAlert(type: string, message: string): void {
    this.saveAlertType = type;
    this.saveAlertMessage = message;
    // Timeout para que se cierre el save alert despues de 3 segundos
    this.delay(2500, () => {
      if (this.saveAlert) this.saveAlert.close();
    });
  }

  onSaveAlertClose(): void {
    this.saveAlertMessage = '';
    this.saveAlertType = '';
  }

  // async timeout que recibe un callback
  async delay(ms: number, callback: () => void): Promise<void> {
    return new Promise((resolve) =>
      setTimeout(() => {
        callback();
        resolve();
      }, ms)
    );
  }

  // ------------------- DOM Functions -------------------
  companieDropdownHandler(event: any): void {
    // 1. Get event value
    const value = (event.target as HTMLInputElement).value;

    // 2. Filter data
    this.autoCompleteDataFiltered = this.sortAutoComField(value);

    // 3. Show dropdown
    if (this.autoCompleteDataFiltered.length > 0) {
      if (!this.companieDropdown.isOpen()) this.companieDropdown.open();
    } else {
      if (this.companieDropdown.isOpen()) this.companieDropdown.close();
    }
  }

  sortAutoComField(value: string): string[] {
    try {
      // get field from autocomplete data
      const maxItems = 5;

      return this.autoCompleteData
        .filter((item: string) => {
          return item.trim().toLowerCase().includes(value.toLowerCase());
        })
        .slice(0, maxItems); // filter
    } catch (error) {
      return [];
    }
  }

  onTextAreaResize(textarea: HTMLTextAreaElement): void {
    // Funcion que ajusta el tamaño del textarea
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  reOrderDestinatarios(): void {
    // Funcion comparativa
    const customCompare = (a: string, b: string): number => {
      const categoryOrder = {
        Armador: 1,
        Trader: 2,
        Recibidor: 3,
        'A.A': 4,
        Otros: 5,
      };
      // @ts-ignore
      return categoryOrder[a] - categoryOrder[b];
    };
    this.destinatarios.controls.sort((a, b) => {
      const categoryA = a.value.role;
      const categoryB = b.value.role;
      return customCompare(categoryA, categoryB);
    });
  }

  getInitials(name: string): string {
    let initials = '';
    const words = name.split(' ');
    for (let i = 0; i < words.length; i++) {
      const firstLetter = words[i].charAt(0).toUpperCase();
      initials += firstLetter;
    }
    return initials;
  }

  // end of DOM functions
}
