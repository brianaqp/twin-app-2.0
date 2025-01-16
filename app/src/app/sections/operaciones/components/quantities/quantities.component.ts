import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  HoldCargos,
  InitialQuantitie,
  QuantitieTtl,
  Quantities,
  QuantitiesObject,
} from '../../../../interfaces/register';
import { CommonFunctionsService } from '../../../../services/common-functions.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-operaciones-cantidades',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './quantities.component.html',
  styleUrls: ['./quantities.component.scss'],
})
export class QuantitiesComponent implements OnInit {
  @Input() flow!: string;
  @Input() date!: string;
  @Input() showVariables!: any;
  @Input() stowagePlan!: any;
  @Input() manualTable!: QuantitieTtl;
  @Input() holdCargos!: HoldCargos[];
  @Input() workingPort!: string;
  @Input() workingDates!: string[];
  @Input() quantities!: Quantities;
  @Input() showQttTables!: any;
  @Input() receiversForm!: FormGroup;
  @Output() quantitieChangeEvent = new EventEmitter<any>();
  // Show Variables

  constructor(private readonly cmnSvc: CommonFunctionsService) {}

  ngOnInit(): void {
    this.initVariables();
  }
  // ------ VARIABLES SETTING ------
  initVariables(): void {
    // 1. Si el objeto es undefined, se inicializa
    if (!this.quantities) {
      this.quantities = {};
    }
    // 2. Si quantitites tiene al menos una fecha, se actualizan las bodegas.
    if (Object.keys(this.quantities).length > 0) {
      this.updateHoldsAtInit();
    }
    // Independiente de las fechas, se inicializan los cargos de bodega
    this.initHoldCargos();
    // 3. Se inicializa la tabla manual
    // Como es un nuevo campo, se debe verificar si existe en la base de datos.
    if (this.manualTable === undefined) {
      this.manualTable = {
        initialTon: '0',
        toBeDischarge: '0',
        perDay: '0',
        previous: '0',
        ttl: '0',
      };
    }
  }

  // ------ EVENTS AND HANDLERS ------
  onDateAdded(date: string): void {
    this.insertDateOnQuantitites(date); // 1. Se inserta la fecha en quantities
    this.setInitialQuantities(date); // 2. Se crean las cantidades iniciales para esa fecha.
    this.recalculateQuantities('all'); // 3. Se recalculan las cantidades
  }

  onDateRemoved(date: string): void {
    // 1. Se elimina la fecha en quantities
    delete this.quantities[date];
    // 2. Proceso de recalcular cantidades
    this.recalculateQuantities('all');
  }

  // Metodo que se ejecuta al cambiar el tonelaje total de los recibidores
  onReceiversTotalChange(): void {
    // 1. Se actualiza el valor de las cantidades receiversData
    this.updateQuantities('reset-initials', 'receivers');
    // 2. Se actualiza el valor de las cantidades products
    this.evalProductsQuantitites();
    // 4. Se recalculan las cantidades.
    this.recalculateQuantities('all');
  }

  // Metodo que se ejecuta al agregarse un recibidor.
  onReceiversAdded(): void {
    this.updateQuantities('add', 'receivers');
    this.evalProductsQuantitites();
    this.recalculateQuantities('receivers');
    this.recalculateQuantities('products');
  }

  // Metodo que se ejecuta al eliminar un recibidor.
  onReceiversRemoved(): void {
    this.updateQuantities('delete', 'receivers');
    this.evalProductsQuantitites();
    this.recalculateQuantities('receivers');
    this.recalculateQuantities('products');
  }

  // Metodo que se ejecuta al cambiar el producto de un recibidor.
  onReceiversProductsChange(): void {
    this.evalProductsQuantitites();
    this.recalculateQuantities('products');
  }

  // Handlers que se ejecuta al cambiar el tonelaje de las bodegas
  holdsQttInputHandler() {
    this.quantitiesInputHandler('holds');
  }
  productsQttInputHandler() {
    this.quantitiesInputHandler('products');
  }
  receiversQttInputHandler() {
    this.quantitiesInputHandler('receivers');
  }

  manualTableInputHandler(): void {
    this.calculateManualTable();
    this.quantitieChangeEvent.emit('manual-table-changes');
  }

  quantitiesInputHandler(category: string) {
    this.recalculateQuantities(category);
  }

  holdsCargosInputHandler(index: number): void {
    this.quantitieChangeEvent.emit(`hold-cargos-changes-${index}`);
  }
  // ------ EVENTS END ------
  // ------ MANUAL TABLE ------
  // Metodo que calcula la tabla manual de cantidades
  calculateManualTable(): void {
    const { initialTon, previous, perDay, ttl } = this.manualTable;
    // Se actualiza el valor de ttl
    const newTtl = this.sumToStrings(previous, perDay);
    this.manualTable.ttl = newTtl;
    // Se actualiza el valor de toBeDischarge
    const newToBeDischarge = this.sumToStrings(initialTon, `-${newTtl}`);
    this.manualTable.toBeDischarge = newToBeDischarge;
  }
  // ------ END MANUAL TABLE ------
  // ------ QUANTITIES LOGIC ------
  // Metodo que inserta un objeto QuantitiesObjet en quantities[date].
  insertDateOnQuantitites(date: string): any {
    const ttlObj: QuantitieTtl = {
      initialTon: '0.000',
      previous: '0.000',
      perDay: '0.000',
      ttl: '0.000',
      toBeDischarge: '0.000',
    };

    this.quantities[date] = {
      receivers: {
        data: [],
        ttl: ttlObj,
      },
      holds: {
        data: [],
        ttl: ttlObj,
      },
      products: {
        data: [],
        ttl: ttlObj,
      },
      general: ttlObj,
    };
  }

  updateHoldsAtInit(): void {
    // Funciones de actualizacion completa
    this.updateQuantities('delete-repetead', 'holds');
    this.updateQuantities('add', 'holds');
    this.updateQuantities('delete', 'holds');
    this.updateQuantities('reset-initials', 'holds');
  }

  initHoldCargos(): void {
    try {
      // 1. Check if exist, otherwise init

      if (this.holdCargos === undefined || this.holdCargos === null) {
        this.holdCargos = [];
      }
      // 2. If exist, update
      const stowageItems = Object.keys(this.stowagePlan.data).length;
      const holdCargosItems = this.holdCargos.length;
      // 2.1 if stowage have more items than holdCargos, add the difference
      if (stowageItems > holdCargosItems) {
        for (let i = holdCargosItems; i < stowageItems; i++) {
          this.holdCargos.push({ hold: (i + 1).toString(), cargo: '' });
        }
      }
      // 2.2 if stowage have less items than holdCargos, remove the difference
      if (stowageItems < holdCargosItems) {
        this.holdCargos = this.holdCargos.slice(0, stowageItems);
      }
    } catch (error) {
      console.error('Error al inicializar los cargos de bodega', error);
    }
  }

  // Metodo que actualiza las cantidades de la categoria, dependiendo el comando.
  updateQuantities(cmd: string, category: string): void {
    // reset-initials: Resetea las cantidades iniciales.
    // add: Agrega las cantidades.
    // delete: Elimina las cantidades.
    // delete-repetead: Elimina las cantidades repetidas. (Funcion para bodegas)
    try {
      // 1. Si no hay fechas, se retorna.
      if (this.workingDates.length < 1) return;
      // 2. Si el comando es update, se actualizan las cantidades
      if (cmd === 'reset-initials') {
        const newQuantities = this.getNewQuantities(category);
        // Se cicla por fechas
        this.workingDates.forEach((date) => {
          // Se cicla por cantidades
          newQuantities.forEach((item) => {
            // Se busca el item original en el objeto quantities en la fecha y categoria correspondiente
            const objetoOriginal = this.quantities[date][category].data.find(
              (original) => {
                return original.name === item.name;
              },
            );
            if (objetoOriginal) {
              // Si hay un registro anterior, se actualizaran
              // - El tonelaje inicial
              // - Tonelaje a descargar
              objetoOriginal.initialTon = item.tonelaje;
              objetoOriginal.toBeDischarge = this.sumToStrings(
                objetoOriginal.initialTon,
                `-${objetoOriginal.ttl}`,
              );
            }
          });
        });
      }
      if (['add', 'delete'].includes(cmd)) {
        // 1. Se obtienen las nuevas cantidades por categoria agrupadas
        const newQuantities = this.getNewQuantities(category); //
        // 2.  De las cantidades nuevas se obtienen los nombres.
        const newNames = newQuantities.map((item) => item['name']);
        // Get old names, if doest exist, it will be an empty array
        const oldNames = this.quantities[this.workingDates[0]][
          category
        ].data.map((item) => item['name']);
        // 3. Se comparan los nombres para obtener las cantidades a agregar y eliminar
        const quantitiesToAdd = newQuantities.filter(
          (item) => !oldNames.includes(item['name']),
        );
        const quantitiesToDelete = oldNames.filter(
          (name) => !newNames.includes(name),
        );
        // 4. Se cicla por fechas;
        // Dependiendo el comando, se agregan o eliminan las cantidades
        this.workingDates.forEach((date) => {
          if (cmd === 'add') {
            quantitiesToAdd.forEach((item) => {
              this.addQuantitie(item, date, category);
            });
          }
          if (cmd === 'delete') {
            quantitiesToDelete.forEach((name) =>
              this.deleteQuantitie(name, date, category),
            );
          }
        });
        // 5. Si se agregaron cantidades, se ordenan alfabeticamente
        if (cmd === 'add' && quantitiesToAdd.length > 0) {
          if (['receivers', 'products'].includes(category)) {
            this.orderQuantitiesAlfabetic(category);
          }
        }
      }
      if (cmd === 'delete-repetead') {
        for (let date of this.workingDates) {
          const data = this.quantities[date][category].data;
          const uniqueNames: string[] = [];
          const uniqueData: QuantitieTtl[] = [];

          data.forEach((item: QuantitieTtl) => {
            if (!uniqueNames.includes(item['name'])) {
              uniqueNames.push(item['name']);
              uniqueData.push(item);
            }
          });
          this.quantities[date][category].data = uniqueData;
        }
      }
    } catch (error) {
      console.error('Error al actualizar las cantidades', error);
    }
  }

  // Metodo que ordena alfabeticamente las cantidades de la categoria recibida.
  orderQuantitiesAlfabetic(category: string): void {
    try {
      this.workingDates.forEach((date) => {
        const data = this.quantities[date][category].data;
        const orderedData = data.sort((a, b) => {
          return a.name
            .toLocaleLowerCase()
            .localeCompare(b.name.toLocaleLowerCase());
        });
        this.quantities[date][category].data = orderedData;
      });
    } catch (error) {
      console.error('Error al ordenar alfabeticamente las cantidades', error);
    }
  }

  // Metodo que añade un objeto quantities con fecha y categoria
  // al objeto quantities
  // Nota: Cada que se llame este metodo, se necesita ordenar alfabeticamente.
  addQuantitie(item: InitialQuantitie, date: string, category: string): void {
    this.quantities[date][category].data.push({
      name: item.name,
      initialTon: item.tonelaje,
      previous: '0.000',
      perDay: '0.000',
      ttl: '0.000',
      toBeDischarge: '0.000',
    });
  }

  // Metodo que elimina un objeto quantities en la fecha y categoria recibida.
  deleteQuantitie(name: string, date: string, category: string): void {
    const oldData = this.quantities[date][category].data;
    const newData = oldData.filter((item) => {
      return item.name !== name;
    });
    this.quantities[date][category].data = newData;
  }

  // Metodo que intermedia el proceso de actualizar los productos
  evalProductsQuantitites(): void {
    // 1. Si no hay fechas, retorna.
    if (this.workingDates.length < 1) {
      return;
    }
    // Agrega, elimina, y actualiza los productsos
    this.updateQuantities('add', 'products');
    this.updateQuantities('delete', 'products');
    this.updateQuantities('reset-initials', 'products');
  }

  // Metodo que retorna un arreglo de objetos InitialQuantities[] de las cantidades actuales.
  getDataForQuantities(
    rawValues: Record<string, any>,
    nameKey: string,
    quantityKey: string,
  ): InitialQuantitie[] {
    // Desglosa el objeto y retorna un arreglo de objetos InitialQuantities[], ejemplo:
    // rawValues: [{ name: 'name', tonelaje: 'tonelaje'}]
    return Object.values(rawValues).map((item: Record<string, any>) => {
      const name = item[nameKey];
      const tonelaje = item[quantityKey];
      return { name, tonelaje };
    });
  }
  // Metodo que retorna un arreglo de objetos InitialQuantities[] de las cantidades en su estado actual.
  getNewQuantities(category: string): InitialQuantitie[] {
    // 1. Se declara la variable con el modelo de datos
    let rawData: InitialQuantitie[] = [];
    // 2. Dependiendo de la categoria, se consigue la data modelada
    if (category === 'receivers') {
      rawData = this.getDataForQuantities(
        Object.values(this.receiversForm.value.receivers),
        'name',
        'tonelaje',
      );
    }
    if (category === 'holds') {
      const port = this.workingPort; // Bodegas por puerto
      rawData = this.getDataForQuantities(
        Object.values(this.stowagePlan.data),
        'hold',
        port,
      );
    }
    if (category === 'products') {
      rawData = this.getDataForQuantities(
        Object.values(this.receiversForm.value.receivers),
        'producto',
        'tonelaje',
      );
    }
    // 3. Con un conjunto de cantidades iniciales, se agrupan por nombre para sumar su tonelaje.
    const tonelajePorNombre: Record<string, number> = {};
    rawData.forEach((item: InitialQuantitie) => {
      const { name, tonelaje } = item;
      const tonelajeFloat = this.cmnSvc.convertStringToFloat(tonelaje);
      // If is not a valid number, it will be 0
      tonelajePorNombre[name] = (tonelajePorNombre[name] || 0) + tonelajeFloat;
    });

    // 4. Se ordena alfabeticamente, sin importar mayusculas o minusculas.
    const orderedNames = Object.keys(tonelajePorNombre).sort((a, b) => {
      return a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase());
    });

    // 5. Se retorna un arreglo de objetos InitialQuantitie[] con el nombre y el tonelaje
    return orderedNames.map((name) => {
      return {
        name,
        tonelaje: this.cmnSvc.getTonFormat(tonelajePorNombre[name]),
      };
    });
  }

  // Metodo que inicializa las cantidades iniciales en la fecha recibida.
  setInitialQuantities(date: string): void {
    // Ciclar cada una de las categorias
    for (let category of ['receivers', 'holds', 'products']) {
      // Por cada categoria, se obtienen las cantidades y se anexan a las nuevas cantidades
      const quantities = this.getNewQuantities(category);
      quantities.forEach((item) => {
        this.addQuantitie(item, date, category);
      });
      // Al finalizar, se ordenan alfabeticamente
      if (['receivers', 'products'].includes(category)) {
        this.orderQuantitiesAlfabetic(category);
      }
    }
  }

  // Metodo que intermedia el proceso de recalcular las cantidades, para definir cuantas categorias se van a recalcular.
  recalculateQuantities(cmd: string): void {
    const filteredDates = this.filterDates();
    // Si no hay fechas, retorna.
    if (filteredDates.length < 1) {
      return;
    }

    if (cmd === 'all') {
      this.recalculateQuantitiesProcess(filteredDates, [
        'receivers',
        'holds',
        'products',
      ]);
      return;
    }
    if (['receivers', 'products', 'holds'].includes(cmd)) {
      this.recalculateQuantitiesProcess(filteredDates, [cmd]);
    } else {
      console.error('Comando no valido para recalcular cantidades');
    }
  }

  // Metodo que recalcula las cantidades
  private recalculateQuantitiesProcess(
    dates: string[],
    categories: string[],
  ): void {
    try {
      let previousDate = '';
      dates.forEach((date, dateIndex) => {
        for (let category of categories) {
          const dateRef: QuantitiesObject[] =
            this.quantities[date][category].data;
          // Primeras fechas por categoria
          if (dateIndex < 1) {
            dateRef.forEach((item) => {
              item.previous = '0';
              item.ttl = item.perDay;
              item.toBeDischarge = this.sumToStrings(
                item.initialTon,
                `-${item.ttl}`,
              );
            });
          } else {
            // Fechas posteriores, se comparan con las anteriores
            const previousData: QuantitiesObject[] =
              this.quantities[previousDate][category].data;
            dateRef.forEach((item) => {
              // El item previo se busca por nombre.
              const previousItem = previousData.find((original) => {
                return original['name'] === item['name'];
              })!;
              item.previous = previousItem.ttl;
              item.ttl = this.sumToStrings(item.perDay, item.previous);
              item.toBeDischarge = this.sumToStrings(
                item.initialTon,
                `-${item.ttl}`,
              );
            });
          }
        }
        previousDate = date;
      });
      // Al terminar, se calculan los totales
      this.calculateQttTotal();
      // Y se emite el evento de cambio
      this.quantitieChangeEvent.emit('recalculate-quantities-process-end');
    } catch (error) {
      console.error('Error al recalcular las cantidades', error);
    }
  }

  // Metodo que recalcula los totales.
  calculateQttTotal(): void {
    let newTotals: QuantitieTtl = {
      initialTon: '',
      previous: '',
      perDay: '',
      ttl: '',
      toBeDischarge: '',
    };

    this.workingDates.forEach((date) => {
      for (let category of ['receivers', 'holds', 'products']) {
        this.quantities[date][category].data.forEach((item) => {
          newTotals.initialTon = this.sumToStrings(
            newTotals.initialTon,
            item.initialTon,
          );
          newTotals.previous = this.sumToStrings(
            newTotals.previous,
            item.previous,
          );
          newTotals.perDay = this.sumToStrings(newTotals.perDay, item.perDay);
          newTotals.ttl = this.sumToStrings(newTotals.ttl, item.ttl);
          newTotals.toBeDischarge = this.sumToStrings(
            newTotals.toBeDischarge,
            item.toBeDischarge,
          );
        });
        this.quantities[date][category].ttl = newTotals;
        newTotals = {
          initialTon: '0',
          previous: '0',
          perDay: '0',
          ttl: '0',
          toBeDischarge: '0',
        };
      }
    });
  }

  // ------ QUANTITIES LOGIC END ------

  // --- EXPORT DATA
  exportData(): any {
    return {
      quantities: this.quantities,
      showQttTables: this.showQttTables,
      manualTable: this.manualTable,
      holdCargos: this.holdCargos,
    };
  }

  // CLEAR AND SETTING DATA
  setData(): void {
    // Funcion que setea la data a quantities
  }

  // ------ FUNCTIONS ------
  sumToStrings(a: string, b: string): string {
    const aInValue = this.cmnSvc.convertStringToFloat(a);
    const bInValue = this.cmnSvc.convertStringToFloat(b);
    const resultado = aInValue + bInValue;
    return this.cmnSvc.getTonFormat(resultado);
  }

  filterDates(): string[] {
    // Retorna una lista con las fechas acomodadas por fechas
    return this.workingDates.sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA.getTime() - dateB.getTime();
    });
  }

  // ------ FUNCTIONS END ------
  // ------ DOM METHODS ------
  // Metodo que se ejecuta al cambiar si un elemento se muestra o no.
  onShowTableChange(): void {
    this.quantitieChangeEvent.emit('showQttTables-changes');
  }

  get flowName(): string {
    return this.cmnSvc.getFlowString(this.flow);
  }

  get flowType(): string {
    return this.cmnSvc.getFlowType(this.flow);
  }
}
