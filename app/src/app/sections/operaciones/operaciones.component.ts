import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  Subject,
  Subscription,
  debounceTime,
  firstValueFrom,
  pipe,
  takeUntil,
} from 'rxjs';
import { TimesComponent } from './components/times/times.component';
import {
  GeneralData,
  Recibidor,
  Register,
  Times,
} from '../../interfaces/register';
import { Router, RouterModule } from '@angular/router';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { QuantitiesComponent } from './components/quantities/quantities.component';
import {
  NgbAlertModule,
  NgbCollapseModule,
  NgbDropdown,
  NgbDropdownModule,
  NgbOffcanvas,
  NgbOffcanvasRef,
} from '@ng-bootstrap/ng-bootstrap';
import { Vessel } from '../../interfaces/vessel';
import { RepositoriesService } from '../../services/repositories.service';
import { CommonFunctionsService } from '../../services/common-functions.service';
import { NavbarService } from '../../services/navbar.service';

// UPDATE
// Quiero estrucutarlo a futuro para que no se tenga que actualizar en cada fecha, sino de manera general.
// 1. Form que tenga las fechas.
// 2. Al submit, que se suba el value del form.

@Component({
  selector: 'app-reporte-de-operaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbCollapseModule,
    NgbAlertModule,
    NgbDropdownModule,
    RouterModule,
    QuantitiesComponent,
    TimesComponent,
    DatePipe,
  ],
  templateUrl: './operaciones.component.html',
  styleUrls: ['./operaciones.component.scss'],
})
export class OperacionesComponent {
  date!: string;
  workingPort!: string; // !!! posible error
  registerId!: string;
  registerData!: Register;
  vesselData!: Vessel;
  localTimes: Times = {};
  workingDates!: Array<string>;
  // Status variables
  isDataLoaded: boolean = false;
  // Autocomplete
  @ViewChild('receiversDropdown') receiversDropdown!: NgbDropdown;
  autoCompleteData: string[] = [];
  autoCompleteDataFiltered: string[] = []; // Idea: Use signals to update states
  // table values
  // product form
  productForm!: FormGroup;
  productsControls!: FormArray;
  productInput: string = '';
  totalValueSubs!: Subscription;
  // receivers form
  receiversForm!: FormGroup;
  receiversControls!: FormArray;
  // receivers inputs
  recName: string = '';
  recRazonSocial: string = '';
  recAa: string = '';
  recTonelaje: string = '';
  recProducto: string = '0';
  recTerminal: string = '';
  // rec obj
  recSum: string = '';
  // remakrs
  generalRemarks: string = '';
  masterRemarks: string = '';
  // nor
  norTendered: string = '';
  norPresented: string = '';
  // bl form
  blForm!: FormGroup;
  blControls!: FormArray;
  showTable: boolean = true;
  // subject
  $saveEventSubject = new Subject<void>();
  $apiEventSubject = new Subject<any>();

  // Times component
  @ViewChild('arrival') arrivalTimes!: TimesComponent;
  @ViewChild('stop') stopTimes!: TimesComponent;
  @ViewChild('operational') operationalTimes!: TimesComponent;
  @ViewChild('sailing') sailingTimes!: TimesComponent;
  // Quantitie Component
  @ViewChild('quantitiesCmp') quantititesCmp!: QuantitiesComponent;
  showQttTables = {
    showGeneralQtt: true,
    showReceiversQtt: true,
    showProductsQtt: true,
    showHoldsQtt: true,
  };
  // sidebar
  @ViewChild('sidemenu') sideMenuTemplate!: TemplateRef<any>;
  isSidebarCollapsed: boolean = true;
  // Subscriptions
  private sideMenuCollSubs!: Subscription;
  // events
  private eventSubs!: Subscription;

  constructor(
    private readonly repoSvc: RepositoriesService,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private cmnSvc: CommonFunctionsService,
    private navbarService: NavbarService,
    private offCvService: NgbOffcanvas,
  ) {
    const routerData: any = this.router.getCurrentNavigation()?.extras.state;
    this.registerId = routerData.registerId;
    this.vesselData = routerData.vesselData;
    this.workingPort = routerData.workingPort;
  }

  // Getters
  flowType(category: string): string {
    return category === 'receivers'
      ? this.cmnSvc.getFlowType(this.registerData.flow)
      : category;
  }

  // AutoComplete Functions
  ngAfterViewInit(): void {
    console.log('Hola!');
    // Include pullrequest to get dropdown data
    const data = this.repoSvc.getSocialReasons().subscribe((res) => {
      this.autoCompleteData = res.data;
    });
  }
  // --- HANDLERS
  // Metodo que maneja el dropdown de la RZ de los recibidores.
  receiversDropdownHandler(event: Event): void {
    // 1. Get the value of the input.
    const value = (event.target as HTMLInputElement).value;

    // 2. Sort the data
    this.autoCompleteDataFiltered = this.sortAutoComField(value);

    // 3. Open
    if (this.autoCompleteDataFiltered.length > 0) {
      if (!this.receiversDropdown.isOpen()) this.receiversDropdown.open();
    } else {
      this.receiversDropdown.close();
    }
  }

  // Metodo que maneja el evento Input en el tonelaje de un recibidor
  recTonInputHandler(control: AbstractControl): void {
    try {
      // 1. Suma de nuevo el total de los recibidores.
      this.sumReceiversTotal();
      // 2. Cambia el tonelaje del BL correspondiente
      const recId = control.value.id;
      const tonelaje = control.value.tonelaje;

      // 3. Patch new ton value
      this.blControls.controls.forEach((bl) => {
        if (bl.value.id === recId) {
          bl.patchValue({ weight: tonelaje });
        }
      });

      // 4. Send change to bl event
      this.onBlChange('weight');
    } catch (error) {
      console.error('Error trying to handler rec Ton input -> ', error);
    }
  }

  sortAutoComField(value: string): string[] {
    try {
      const maxItems = 5;

      // Comparing the value trimmed, lowercased. Adding only the first 5 results.
      return this.autoCompleteData
        .filter((item: string) => {
          return item.trim().toLowerCase().includes(value.toLowerCase());
        })
        .slice(0, maxItems);
    } catch (e) {
      // Error handling
      return [];
    }
  }

  fillAutocompleteData(): void {
    // Funcion que llena el arreglo de datos para el autocompletado
    try {
      const allRecs = this.receiversControls.value;
      for (let rec of allRecs) {
        if (this.autoCompleteData.indexOf(rec.razonSocial) === -1) {
          this.autoCompleteData.push(rec.razonSocial);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  // ON INIT METHODS //
  ngOnInit(): void {
    try {
      this.pullData().then(() => {
        // print registers
        this.initVariables();
        this.initForms();
        this.trackReceiverTotal();
        this.isDataLoaded = true;
        this.configSubjects();
        this.connectNavbarSvc();
        this.fillAutocompleteData();
      });
    } catch (error) {
      console.log(error);
    }
  }

  // --- EVENTS --- //
  // Evento que se dispara al recibir de cantidades:
  // 1. Un cambio en el showVariable
  onQttEvent(event: string): void {
    this.autoSavingFunc('qtt-event, event: ' + event);
  }

  // Funcion que se suscribe a los cambios de ciertas variables importantes y ejecuta logica.
  trackReceiverTotal() {
    const totalControl = this.receiversForm.get('total') as FormControl;
    this.totalValueSubs = totalControl.valueChanges.subscribe(() => {
      this.quantititesCmp.onReceiversTotalChange();
    });
  }

  // Metodo que conecta el navbar con el service del navbar
  connectNavbarSvc() {
    // Setea el estado del navbar en true
    this.navbarService.setSideMenuState(true);
    // Subscripcion al estado collapsed del navbar
    this.sideMenuCollSubs = this.navbarService.sideMenuCollapsed$.subscribe(
      (state) => {
        this.isSidebarCollapsed = state;
        this.onSideMenuStateChange();
      },
    );
    // Subscripcion al evento de resize
    this.eventSubs = this.navbarService.resizeEvent$.subscribe(() => {
      if (this.offCvService.hasOpenOffcanvas()) {
        this.offCvService.dismiss('window-resize');
      }
    });
  }

  onSideMenuStateChange() {
    // Metodo que se ejecuta cuando el estado del menu lateral cambia
    if (!this.isSidebarCollapsed) {
      // open
      const offCanvasReff = this.offCvService.open(this.sideMenuTemplate);
      this.configSideMenu(offCanvasReff);
    }
  }

  configSideMenu(offcanvas: NgbOffcanvasRef) {
    // Metodo que configura el offcanvas
    offcanvas.result.finally(() => {
      // Independiente al resultado, se ejecuta este metodo
      this.navbarService.toggleSMCollapseState();
    });
  }

  async pullData(): Promise<void> {
    this.registerData = await firstValueFrom(
      this.repoSvc.findOne('registers', this.registerId),
    );
    this.vesselData = await firstValueFrom(
      this.repoSvc.findOne('vessels', this.registerData.vesselId),
    );
  }

  initVariables(): void {
    // 1. LocalTimes
    this.localTimes = this.registerData.reports[this.workingPort].times; // TODO: Que router de la data especifica. (Envia todo!)
    delete this.localTimes['undefined']; // delete if undefined
    // 2. WorkingDates
    this.workingDates = Object.keys(this.localTimes);
    // 3. Show variables
    this.showTable = this.registerData.reports[this.workingPort].data.showTable;
    this.showQttTables = {
      showGeneralQtt:
        this.registerData.reports[this.workingPort].data.showGeneralQtt,
      showReceiversQtt:
        this.registerData.reports[this.workingPort].data.showReceiversQtt,
      showProductsQtt:
        this.registerData.reports[this.workingPort].data.showProductsQtt,
      showHoldsQtt:
        this.registerData.reports[this.workingPort].data.showHoldsQtt,
    };
  }

  initForms(): void {
    // Forms
    this.productForm = this.fb.group({
      products: this.fb.array([]),
    });
    this.productsControls = this.productForm.get('products') as FormArray;
    //
    this.receiversForm = this.fb.group({
      receivers: new FormArray([]),
      total: new FormControl('0'),
    });
    this.receiversControls = this.receiversForm.get('receivers') as FormArray;
    //
    this.blForm = this.fb.group({
      data: new FormArray([]),
      ttl: new FormGroup({
        weight: new FormControl(''),
        scale: new FormControl(''),
        diff: new FormControl(''),
      }),
    });
    this.blControls = this.blForm.get('data') as FormArray;
    //
    for (let product of this.registerData.reports[this.workingPort].data
      .products) {
      this.productsControls.push(new FormControl(product));
    }
    for (let rec of this.registerData.reports[this.workingPort].data
      .receiversData.receivers) {
      // receiversForm
      const newControl = this.fb.group({ ...rec });
      this.receiversControls.push(newControl);
      // Se genera en el BLForm
      this.blControls.push(
        this.fb.group({
          id: new FormControl(),
          name: new FormControl(),
          bl: new FormControl(),
          weight: new FormControl('0'),
          scale: new FormControl('0'),
          diff: new FormControl('0'),
        }),
      );
    }
    // set if existe
    const data = this.registerData.reports[this.workingPort].data;
    this.receiversForm.patchValue({ total: data.receiversData.total });
    this.blForm.patchValue(data.blData);
    this.generalRemarks =
      this.registerData.reports[this.workingPort].data.generalRemarks;
    this.masterRemarks =
      this.registerData.reports[this.workingPort].data.masterRemarks;
    // // if existe
    this.norPresented =
      this.registerData.reports[this.workingPort].data.norPresented;
    this.norTendered =
      this.registerData.reports[this.workingPort].data.norTendered;
  }

  // Metodo que configura los subjects.
  configSubjects(): void {
    // 1. saveEventSubject. Se dispara cuando se detecta un cambio en los formularios.
    // productsForm
    this.productForm.valueChanges
      .pipe(takeUntil(this.$saveEventSubject))
      .subscribe((changes) => {
        this.autoSavingFunc('productsForm-changes');
      });
    // receiversForms
    this.receiversForm.valueChanges
      .pipe(takeUntil(this.$saveEventSubject))
      .subscribe((changes) => {
        this.autoSavingFunc('receiversForm-changes');
      });
    // blForm
    this.blForm.valueChanges
      .pipe(takeUntil(this.$saveEventSubject))
      .subscribe((changes) => {
        this.autoSavingFunc('blForm-changes');
      });
    // 2. apiEventSubject. Intermediario que reduce la cantidad de peticiones al servidor.
    this.$apiEventSubject.pipe(debounceTime(1000)).subscribe((data) => {
      this.repoSvc.updateTimes('registers', data).subscribe();
    });
  }

  // Funcion que retorna el id que los recibidores necesitan
  generateReceiverId(): string {
    if (this.receiversControls.value.length === 0) {
      // Registro vacio
      return '0';
    }
    const allIds = this.receiversControls.value.map((item: Recibidor) =>
      parseInt(item.id),
    ); // () equivale a { return: value }
    const lastId = Math.max(...allIds);
    return (lastId + 1).toLocaleString('en-US');
  }

  // add product
  addProduct(): void {
    this.productsControls.push(new FormControl(this.productInput));
    this.productInput = '';
  }

  // delete product
  deleteProduct(index: number): void {
    this.productsControls.removeAt(index);
  }

  // Se anade un recibidor
  addReceiver(): void {
    // 0. Add receivers name to autoCompleteData
    // Se agrega la descripcion al arreglo de descripciones, si no existe
    if (this.autoCompleteData.indexOf(this.recRazonSocial) === -1) {
      this.autoCompleteData.push(this.recRazonSocial);
    }
    // 1. Se toman los valores de los inputs y se aplican a los formularios.
    const newId = this.generateReceiverId();
    this.recName = this.recName.replace(/\s+$/, '');
    const newReceiverControl = this.fb.group({
      id: new FormControl(newId),
      name: new FormControl(this.recName),
      razonSocial: new FormControl(this.recRazonSocial),
      agenteAduanal: new FormControl(this.recAa),
      tonelaje: new FormControl(this.recTonelaje),
      producto: new FormControl(this.recProducto),
      terminal: new FormControl(this.recTerminal),
    });
    const newBlControl = this.fb.group({
      id: new FormControl(newId),
      name: new FormControl(this.recName),
      bl: new FormControl(''),
      weight: new FormControl(this.recTonelaje),
      scale: new FormControl('0'),
      diff: new FormControl('0'),
    });
    // 2. Se formatea el valor del input.
    this.recRazonSocial = '';
    this.recAa = '';
    this.recTonelaje = '';
    this.recProducto = '0';
    this.recTerminal = '';
    // 3. Se agregan los controles a los formularios.
    this.receiversControls.push(newReceiverControl);
    this.blControls.push(newBlControl);
    // 3.5 Update BlWeight values
    this.onBlChange('weight');
    // 4. Se ordenan alfabeticamente los controles.
    this.updateFormInAlphabet(this.receiversControls);
    this.updateFormInAlphabet(this.blControls);
    // 5. Se le notifica al componente de cantidades que se anadio un recibidor.
    this.quantititesCmp.onReceiversAdded();
    // 6. Se actualiza el valor del tonelaje total
    this.sumReceiversTotal();
    // 6. El input que contiene el nombre se resetea.
    this.recName = '';
  }

  // Funcion que borra un recibidor recibiendo un controlador de formulario
  deleteReceiver(control: AbstractControl): void {
    // 1. Elimado de Receivers
    const recIndex = this.receiversControls.controls.indexOf(control);
    this.receiversControls.removeAt(recIndex);
    // 2. Eliminado de BlForm
    const recId = control.value.id;
    this.blControls.value.forEach((item: any, index: number) => {
      if (item.id === recId) {
        this.blControls.removeAt(index);
      }
    });
    // 3. Event triggering
    this.quantititesCmp.onReceiversRemoved();
    // 4. Se actualiza el valor del tonelaje total
    this.sumReceiversTotal();
    // Se actualizan todos los totales en el blForm
    for (let category of ['weight', 'scale', 'diff']) {
      this.onBlChange(category);
    }
  }

  // Metodo que ordena alfabeticamente los controles de un formulario.
  updateFormInAlphabet(form: FormArray): void {
    // Si el formulario tiene mas de un controlador, se ordena alfabeticamente.
    try {
      if (form.controls.length < 1) return;
      form.controls.sort((a: AbstractControl, b: AbstractControl) => {
        const nameA: string = a.value.name.toLowerCase();
        const nameB: string = b.value.name.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      form.updateValueAndValidity();
    } catch (error) {
      console.error('Error al ordenar alfabeticamente los controles', error);
    }
  }

  calculateRecSum(): void {
    // Esto se repite arriba, se podria optimizar.
    const receiversGroup = this.receiversForm.get('receivers') as FormGroup;
    let sum = 0;
    for (let control of Object.values(receiversGroup.controls)) {
      const value: string = control.value;
      if (value != '') {
        const regex = /[^-?\d+(\.\d+)?]/g;
        const formattedValue = value.replace(/[^\d.]/g, '');
        const floatValue = parseFloat(formattedValue);
        sum += floatValue;
      }
    }
    const totatControl = this.receiversForm.get('total') as FormControl;
    totatControl.setValue(this.cmnSvc.getTonFormat(sum));
  }

  onBlChange(category: string): void {
    // Metodo recibiendo una categoria, actualiza los totales de su categoria,
    // se calcula la diferencia y se actualiza la diferencia total.
    let categoryTotal = 0;
    let diffTotal = 0;
    // Por cada controlador de formulario
    for (let control of this.blControls.controls) {
      // Logica del total
      const value: string = control.value[category];
      const floatValue = this.cmnSvc.convertStringToFloat(value);
      categoryTotal += floatValue;
      // Logica de la diferencia
      const diff = this.cmnSvc.sumToStrings(
        control.value.scale,
        `-${control.value.weight}`,
      );
      const diffControl = control.get('diff') as FormControl;
      diffControl.setValue(diff);
      diffTotal += this.cmnSvc.convertStringToFloat(diff);
    }
    // Se actualiza el total de la categoria
    const item = this.blForm.get(`ttl.${category}`) as FormControl;
    item.setValue(this.cmnSvc.getTonFormat(categoryTotal));
    // Se actualiza el total de la diferencia
    const diffItem = this.blForm.get(`ttl.diff`) as FormControl;
    diffItem.setValue(this.cmnSvc.getTonFormat(diffTotal));
  }

  onReceiverProductChange(): void {
    this.quantititesCmp.onReceiversProductsChange();
  }

  sumReceiversTotal(): void {
    // Funcion que vuelve a sumar el valor total del valor de los recibidores.
    // Este metodo dispara el evento de cambio de totales en el componente de cantidades.
    let newTotal = 0;
    for (let control of this.receiversControls.controls) {
      const value = this.cmnSvc.convertStringToFloat(control.value.tonelaje);
      newTotal += value;
    }
    let totalAsString: string = this.cmnSvc.getTonFormat(newTotal);
    this.receiversForm.patchValue({ total: totalAsString });
  }

  compareReceivers(oldList: Recibidor[], newList: Recibidor[]): string[] {
    // Funcion que compara dos listas con recibidores y retorna una lista de nombres
    let namesList: string[] = [];
    for (let oldItem of oldList) {
      const isSimilarObject = newList.some((item: Recibidor) => {
        return (
          item.name === oldItem.name &&
          item.razonSocial === oldItem.razonSocial &&
          item.tonelaje === oldItem.tonelaje
        );
      });
      if (isSimilarObject === false) {
        namesList.push(oldItem.name);
      }
    }
    return namesList;
  }

  onDateChanged(clickedDate: string): any {
    // Metodo que actualiza la fecha seleccionada
    if (this.date === clickedDate) this.date = '';
    else {
      this.date = clickedDate;
    }
  }

  addDate(): void {
    // Función que añade los valores de tiempos locales a la fecha seleccionada.
    // 1. Si la fecha es valida, pasa al siguiente paso
    if (
      this.date != undefined &&
      !this.workingDates.includes(this.date) &&
      this.date != ''
    ) {
      // 1. Se anade la fecha a workingDates
      this.workingDates.push(this.date);
      // 2. Se anade la fecha a Localtimes
      this.localTimes[this.date] = {
        arrivalTimes: this.arrivalTimes.times.value,
        stopTimes: this.stopTimes.times.value,
        operationalTimes: this.operationalTimes.times.value,
        sailingTimes: this.sailingTimes.times.value,
      };
      // 3. Quantitites added date event
      this.quantititesCmp.onDateAdded(this.date);
      // 6. Se guardan los valores a la base de datos
      this.autoSavingFunc('date-added');
    }
  }

  limpiarCadena(cadena: string): string {
    // Convierte la cadena a minúsculas y elimina los espacios en blanco
    return cadena.toLowerCase().replace(/\s+/g, '');
  }

  saveDate(event: any): void {
    // Funcion que recibe un evento por parte de tiempos y quantities y guarda sus valores localmente
    // para luego ser guardado a la base de datos
    if (this.date != undefined && this.workingDates.includes(this.date)) {
      // Evita la fecha vacia.
      this.localTimes[this.date] = {
        // Guardado de tiempos
        arrivalTimes: this.arrivalTimes.times.value,
        stopTimes: this.stopTimes.times.value,
        operationalTimes: this.operationalTimes.times.value,
        sailingTimes: this.sailingTimes.times.value,
      };
    }
    this.autoSavingFunc('times-saved');
  }

  deleteDate(): void {
    // Funcion que elimina una fecha cuando deja de usarse.
    if (this.workingDates.includes(this.date)) {
      const dateIndex = this.workingDates.indexOf(this.date);
      // Se elimina la fecha de las fechas trabajando
      this.workingDates.splice(dateIndex, 1);
      // Se borra la fecha de localTimes
      delete this.localTimes[this.date];
      // Se liimpian los componentes de tiempos
      this.arrivalTimes.clearComponent();
      this.stopTimes.clearComponent();
      this.operationalTimes.clearComponent();
      this.sailingTimes.clearComponent();
      // Se borran las cantidades en esa fecha
      // Cantidades
      this.quantititesCmp.onDateRemoved(this.date);

      // Date remove
      this.date = '';

      // Se guardan los cambios.
      this.autoSavingFunc('deleteDate');
    }
  }

  autoSavingFunc(mssg: string): any {
    // Funcion que actualiza automaticamente los valores
    const boxes = this.registerData.reports[this.workingPort].data.signatures;
    const quantitiesCmpData = this.quantititesCmp.exportData();
    // exammple object
    const data: GeneralData = {
      receiversData: this.receiversForm.value,
      blData: this.blForm.value,
      generalRemarks: this.generalRemarks,
      masterRemarks: this.masterRemarks,
      norPresented: this.norPresented,
      signatures: boxes,
      norTendered: this.norTendered,
      products: this.productsControls.value,
      showTable: this.showTable,
      showGeneralQtt: this.showQttTables.showGeneralQtt,
      showReceiversQtt: this.showQttTables.showReceiversQtt,
      showProductsQtt: this.showQttTables.showProductsQtt,
      showHoldsQtt: this.showQttTables.showHoldsQtt,
      manualTable: quantitiesCmpData.manualTable,
    };
    const body = {
      id: this.registerData.id,
      port: this.workingPort,
      updatedData: {
        times: { ...this.localTimes },
        data: data,
        quantities: quantitiesCmpData.quantities,
        holdCargos: quantitiesCmpData.holdCargos,
      },
    };
    this.$apiEventSubject.next(body);
  }

  filterDates(): any {
    // Retorna una lista con las fechas acomodadas por fechas
    return this.workingDates.sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });
  }

  ngOnDestroy(): void {
    // Envia la señal para que takeUntil cancele las subscripciones a los
    // observables conectados al subject
    this.$saveEventSubject.next();
    this.$saveEventSubject.unsubscribe();
    // Completas el subject
    this.$apiEventSubject.complete();
    // Cambia el estado del navbar
    this.navbarService.setSideMenuState(false);
    // Desconecta las subscripciones
    this.sideMenuCollSubs.unsubscribe();
    this.eventSubs.unsubscribe();
    this.totalValueSubs.unsubscribe();
  }
}
