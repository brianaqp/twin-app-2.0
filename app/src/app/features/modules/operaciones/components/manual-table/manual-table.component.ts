import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Quantities } from 'src/app/interfaces/register';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';

@Component({
  selector: 'app-manual-table-cmp',
  templateUrl: './manual-table.component.html',
  styleUrls: ['./manual-table.component.scss'],
})
export class ManualTableComponent implements OnInit, OnChanges {
  totalsForm!: FormGroup;
  totals!: FormGroup;
  @Input() localQuantities: Quantities = {};
  @Input() date!: string;
  @Input() flow!: string;
  @Output() generalPerDayChange = new EventEmitter<any>();
  constructor(
    private readonly fb: FormBuilder,
    private cmnSvc: CommonFunctionsService
  ) {}
  ngOnInit(): void {
    this.initForm();
    this.initVariables();
  }

  get flowType(): string {
    return this.cmnSvc.getFlowString(this.flow);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['date'] && this.date != undefined) {
      this.onDateChanged();
    }
  }

  initForm(): void {
    this.totalsForm = this.fb.group({
      initialTon: new FormControl(''),
      perDay: new FormControl(''),
      previous: new FormControl(''),
      ttl: new FormControl(''),
      toBeDischarge: new FormControl(''),
    });
  }

  initVariables(): void {}

  // Funcion que detecta el cambio de valor en el input de toneladas iniciales
  onPerDayInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.localQuantities[this.date]['general'].perDay = value;
    this.generalPerDayChange.emit();
  }

  onDateChanged(): void {
    // Función que redirige dependiendo de si la fecha existe.
    this.clearComponent();
    if (Object.keys(this.localQuantities).includes(this.date) === true) {
      // Si existe en el registro
      this.setData();
      // this.setTtl();
    }
  }

  setData(): void {
    this.clearComponent(); // Limpieza antes de actualizar
    this.totalsForm.patchValue(this.localQuantities[this.date]['general']);
  }

  clearComponent(): void {
    for (let control of Object.values(this.totalsForm.controls)) {
      control.reset();
    }
  }
}
