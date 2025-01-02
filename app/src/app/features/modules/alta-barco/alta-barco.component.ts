import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { Vessel } from '../../interfaces/vessel';
import { RepositoriesService } from '../../services/repositories.service';

@Component({
  selector: 'app-alta-barco',
  templateUrl: './alta-barco.component.html',
  styleUrls: ['./alta-barco.component.scss'],
})
export class AltaBarcoComponent implements OnInit {
  // vessel configuration
  vesselId!: string;
  vesselData!: Vessel;
  // form configuration
  altaBarcoForm!: FormGroup;
  // router data
  routerData!: any;
  // logic configuration
  editMode: boolean = false;
  isFirstTimeSaving!: boolean;
  // save alert
  @ViewChild('saveAlert') saveAlert!: NgbAlert;
  saveAlertMss!: string;
  saveAlertType!: string;
  constructor(
    private readonly fb: FormBuilder,
    private readonly repoSvc: RepositoriesService,
    private router: Router
  ) {
    this.routerData = this.router.getCurrentNavigation()?.extras.state;
  }

  ngOnInit(): void {
    // 1. Inicializar el formulario
    this.initForm();
    // 2. Verificar si se esta en modo edicion
    if (this.routerData.editMode) {
      this.editMode = this.routerData.editMode;
    }
    // 3. Si se esta en modo edicion, obtener la info de la db
    if (this.editMode === true) {
      this.isFirstTimeSaving = false;
      this.vesselId = this.routerData.id;
      try {
        this.pullData().then(() => {
          console.log('Data received!');
          this.altaBarcoForm.patchValue(this.vesselData);
        });
      } catch (error) {
        console.log('Hubo un error...', error);
      }
    } else {
      this.isFirstTimeSaving = true;
    }
  }

  async pullData(): Promise<void> {
    this.vesselData = await firstValueFrom(
      this.repoSvc.findOne('vessels', this.vesselId)
    );
  }

  initForm(): void {
    this.altaBarcoForm = this.fb.group({
      id: new FormControl(),
      shipParticulars: this.fb.group({
        name: ['', Validators.required],
        flag: [''],
        imo: [''],
        callSign: [''],
        dwt: [''],
        built: [''],
        beam: [''],
        loa: [''],
        grt: [''],
        nrt: [''],
        hH: [''],
        cranes: [''],
      }),
      registers: new FormArray([]),
    });
  }

  getEntries(obj: object): any {
    // Funcion que regresa un arreglo de una propiedad
    return Object.entries(obj).at(0);
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

  generateVesselId(): string {
    const initials = this.getInitials(
      this.altaBarcoForm.value.shipParticulars.name
    );
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    return `${initials}-${day}${month}`;
  }

  onSubmit() {
    // Metodo que sube la informacion a la base de datos
    // Caso: Form es valido
    if (this.formValidStatus === true) {
      // Si es la primera vez que se guarda
      if (this.isFirstTimeSaving === true) {
        // id generate and setting
        const id = this.generateVesselId();
        const idControl = this.altaBarcoForm.get('id') as FormControl;
        idControl.setValue(id);
        // inserting data
        console.log(this.altaBarcoForm.value);
        this.repoSvc
          .insertOne('vessels', this.altaBarcoForm.value)
          .subscribe((res) => {
            if (res.acknowledged === true) {
              this.isFirstTimeSaving = false;
            }
            this.showSaveAlert(res.acknowledged);
          });
      } else {
        // updating if not first time
        this.repoSvc
          .updateOne('vessels', this.altaBarcoForm.value)
          .subscribe((res) => {
            this.showSaveAlert(res.acknowledged);
          });
      }
    } else {
      // Caso: Form no es valido
      this.showSaveAlert(false); // Activar el save alert en error
      this.activateValidateAlerts(); // Activar las alertas de validacion
    }
  }

  // Metodo que regresa el status de validacion del formulario
  get formValidStatus(): boolean {
    return (this.altaBarcoForm.get('shipParticulars') as FormGroup).valid;
  }

  // -------- Metodos del alert de validacion
  validateFormControl(name: string): boolean {
    // Metodo que valida si un form control es valido
    const formControl = this.altaBarcoForm.get(
      `shipParticulars.${name}`
    ) as FormControl;
    return formControl.invalid && formControl.touched;
  }

  // Metodo que activa las alertas de validacion de los form controls
  activateValidateAlerts() {
    const shipParticulars = this.altaBarcoForm.get(
      'shipParticulars'
    ) as FormGroup;
    const controls = shipParticulars.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        controls[name].markAsTouched();
      }
    }
  }
  // Metodo que marca como untouched un form control, y cierra el alert
  onValidAlertClose(name: string) {
    const formControl = this.altaBarcoForm.get(
      `shipParticulars.${name}`
    ) as FormControl;
    formControl.markAsUntouched();
  }

  // -------- Metodos del alert de guardado
  // Metodo que muesta un mensaje de exito o error
  showSaveAlert(response: boolean): void {
    if (response === true) {
      this.saveAlertType = 'success';
      this.saveAlertMss = 'Se ha guardado la información correctamente.';
      // Timeout para que se cierre el save alert despues de 3 segundos
      this.delay(3000, () => {
        if (this.saveAlert) this.saveAlert.close();
      });
    } else {
      // Este se cierra manualmente
      this.saveAlertType = 'danger';
      this.saveAlertMss = 'Hubo un error al guardar la información.';
      // Timeout para que se cierre el save alert despues de 3 segundos
      this.delay(5000, () => {
        if (this.saveAlert) this.saveAlert.close();
      });
    }
  }

  onSaveAlertClose(): void {
    this.saveAlertMss = '';
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
}
