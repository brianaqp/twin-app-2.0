import {
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  EventEmitter,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
} from '@angular/forms';

@Component({
  selector: 'app-times-cmp',
  templateUrl: './times.component.html',
  styleUrls: ['./times.component.scss'],
})
export class TimesComponent implements OnInit, OnChanges {
  form!: FormGroup;
  times!: FormArray;
  startTime: string = '';
  endTime: string = '';
  description: string = '';
  hourValidation = new RegExp('^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$');
  autoCompleteData: string[] = [];
  @Input() date!: string;
  @Input() color!: string;
  @Input() title!: string;
  @Input() category!: string;
  @Input() localTimes!: any;
  @Input() workingDates!: string[];
  @Input() isDataLoaded: boolean = false;
  @Output() timeChangeEvent = new EventEmitter<any>();
  @ViewChild('startTimeInput') startTimeInput!: ElementRef;
  showTimesAlert: boolean = false;
  constructor(private readonly fb: FormBuilder) {}

  sortAutoComField(value: string): string[] {
    const maxItems = 5;

    return this.autoCompleteData
      .filter((item: string) => {
        return item.trim().toLowerCase().includes(value.toLowerCase());
      })
      .slice(0, maxItems); // filter
  }

  ngOnInit(): void {
    this.form = this.initForm();
    this.setFormGetters();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['date'] && this.date != undefined) {
      this.onDateChanged();
    }
    // If data is loaded, load dropdown data
    if (changes['isDataLoaded'] && this.isDataLoaded) {
      this.loadDropdownData();
    }
  }

  // Funcion que filtra las descripciones de tiempos
  async loadDropdownData(): Promise<void> {
    const allTimesSet: Set<string> = new Set();

    this.workingDates.forEach(date => {
      const times = this.localTimes[date];

      ['arrivalTimes', 'stopTimes', 'operationalTimes', 'sailingTimes'].forEach(
        category => {
          times[category].forEach(attribute => {
            const value = attribute.description;

            if (value != null && value.trim() !== '') {
              allTimesSet.add(value.trim());
            }
          });
        }
      );
    });

    this.autoCompleteData = Array.from(allTimesSet);
  }

  initForm(): FormGroup {
    // Declarar las propiedades que tendra nuestro formulario
    return this.fb.group({
      times: new FormArray([]),
    });
  }

  onDateChanged(): void {
    this.clearComponent();
    this.setData();
  }

  formatTime(inputElement: any): void {
    // // id del input
    const elementValue = inputElement.value;
    const valor = elementValue.replace(/[^0-9]/g, ''); // Elimina cualquier carácter que no sea un dígito
    const valorLimitado = valor.slice(0, 4); // Limitacion a 4 caracteres
    // For para incluir el formato hora
    if (valorLimitado.length >= 3) {
      const valorFormateado = valorLimitado
        .slice(0, 2)
        .concat(':', valorLimitado.slice(2, valorLimitado.length));
      inputElement.value = valorFormateado;
    } else {
      inputElement.value = valorLimitado;
    }
    // Cada que se cambia, se verifica que la fecha este actualizada, si no, se muestra un alert
  }

  setFormGetters(): void {
    // normal getters
    this.times = this.form.get('times') as FormArray;
  }

  checkIfTimeExists() {
    // Metodo que actualiza el valor de showTimesAlert
    this.showTimesAlert = !this.workingDates.includes(this.date);
  }

  emitTimeEvent(): void {
    // Funcion que emite un evento al padre cuando el formulario de tiempos cambia
    this.timeChangeEvent.emit({ message: 'event' });
  }

  async addTime(): Promise<void> {
    // Funcion que añade los tiempos al formulario
    if (this.workingDates.includes(this.date)) {
      this.times.push(
        this.fb.group({
          // Slice por las validaciones
          startTime: [this.startTime.slice(0, 5)],
          endTime: [this.endTime.slice(0, 5)],
          description: [this.description.toLocaleUpperCase()],
          category: [this.category],
        })
      );
      // Se agrega la descripcion al arreglo de descripciones, si no existe
      if (this.autoCompleteData.indexOf(this.description) === -1) {
        this.autoCompleteData.push(this.description);
      }

      // Se limpian los inputs
      this.startTime = '';
      this.endTime = '';
      this.description = '';
      this.filterTimes(); // Se ordenan los tiempos
      this.emitTimeEvent(); // Se emite el evento
      this.startTimeInput.nativeElement.focus(); // Se enfoca el input
      // Desactiva la alerta si esta activa
      if (this.showTimesAlert) {
        this.showTimesAlert = false;
      }
      //
    } else {
      // Si no esta en el arreglo de fechas de trabajo, se muestra un alert
      this.showTimesAlert = true;
    }
  }

  deleteTime(item: any): void {
    const index = this.times.controls.indexOf(item);
    this.times.removeAt(index);
    this.emitTimeEvent();
  }

  filterTimes(): AbstractControl[] {
    const rawData = this.times.getRawValue();
    const values = Object.values(rawData);

    values.sort((a, b) => {
      if (a.startTime < b.startTime) {
        return -1;
      }
      if (a.startTime > b.startTime) {
        return 1;
      }
      return 0;
    });
    this.times.setValue(values);
    this.emitTimeEvent();
    return values;
  }

  setData(): void {
    // Funcion que anade valores al form.
    this.clearComponent(); // Se borra cualquier si trabaja con una fecha inexistente.
    if (Object.keys(this.localTimes).includes(this.date)) {
      // Si hay almenos uno, puede setearse la data.
      for (let time of this.localTimes[this.date][this.category]) {
        this.times.push(
          this.fb.group({
            startTime: [time.startTime],
            endTime: [time.endTime],
            description: [time.description],
            category: [time.category],
          })
        );
      }
    }
  }
  clearComponent(): void {
    // Funcion que limpia todo para actualizarlo
    this.times.clear();
  }
}
