import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgbAlert, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { firstValueFrom } from 'rxjs';
import { Register } from '../../interfaces/register';
import { Vessel } from '../../interfaces/vessel';
import { RepositoriesService } from '../../services/repositories.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nominacion-interna',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbAlertModule],
  templateUrl: './nominacion-interna.component.html',
  styleUrls: ['./nominacion-interna.component.scss'],
})
export class NominacionInternaComponent implements OnInit {
  routerData!: any;
  form!: FormGroup;
  showPreview: boolean = false;
  registerId!: any;
  vesselId!: string;
  registerData!: Register;
  vesselData!: Vessel;
  isDataLoaded: boolean = false;
  // style variables, grey border
  cellStyles = {
    'border-bottom': '1px solid #d3d3d3',
    'border-right': 'none',
    'border-left': 'none',
    'border-top': 'none',
    'padding-bottom': '10px',
    'padding-top': '10px',
    'text-align': 'start',
    width: '50%',
  };
  tableStyles = {
    width: '95%',
    'margin-left': '5%',
  };
  // form initial values
  readonly instructionsDefaultMsg: string =
    `Todo requerimiento por el capitán, como basura, cartas náuticas, agua, provisiones,` +
    ` etc., deberá ser primero informado a nuestras oficinas para dicha autorización. Sin autorización por parte de 'Twin Marine de México',` +
    ` no se pagará ninguna factura.`;
  // save Alert
  saveAlertType: string = '';
  saveAlertMessage: string = '';
  @ViewChild('saveAlert') saveAlert!: NgbAlert;

  constructor(
    private readonly repoSvc: RepositoriesService,
    private readonly router: Router,
    private readonly fb: FormBuilder,
  ) {
    this.routerData = this.router.getCurrentNavigation()?.extras.state;
  }

  // Getters

  get flowName(): string {
    switch (this.registerData.flow) {
      case 'Importacion':
        return 'descargar';
      case 'Exportacion':
        return 'cargar';
      default:
        return '***';
    }
  }

  ngOnInit(): void {
    this.registerId = this.routerData.registerId;
    this.vesselId = this.routerData.vesselId;
    this.initForm();
    this.pullData().then(() => {
      console.log('Data Received');
      this.isDataLoaded = true;
      this.setFormIfExist();
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      attn: new FormControl(),
      cargo: new FormControl(),
      cliente: new FormControl(),
      direccion: new FormControl(),
      direccionCuenta: new FormControl(),
      instruccionesEspeciales: new FormControl(this.instructionsDefaultMsg),
    });
  }

  async pullData(): Promise<void> {
    const projection = {
      nominacionInterna: 1,
      stowagePlan: 1,
      flow: 1,
    };
    this.registerData = await firstValueFrom(
      this.repoSvc.findOne('registers', this.registerId, projection),
    );
    this.vesselData = await firstValueFrom(
      this.repoSvc.findOne('vessels', this.vesselId),
    );
    console.log(this.vesselData);
  }

  setFormIfExist(): void {
    console.log(this.registerData);
    this.form.patchValue(this.registerData.nominacionInterna);
  }

  resetInstructionsMessage() {
    const control = this.form.get('instruccionesEspeciales') as FormControl;
    control.setValue(this.instructionsDefaultMsg);
  }

  print(): void {
    window.print();
  }

  onSubmit(): void {
    const data = {
      id: this.registerId,
      nominacionInterna: this.form.value,
    };
    this.repoSvc.updateOne('registers', data).subscribe((res) => {
      this.showSaveAlert(res.acknowledged);
    });
  }

  // -------- Metodos del alert de guardado
  // Metodo que muesta un mensaje de exito o error
  showSaveAlert(response: boolean): void {
    if (response === true) {
      this.saveAlertType = 'success';
      this.saveAlertMessage = 'Se ha guardado la información correctamente.';
      // Timeout para que se cierre el save alert despues de 3 segundos
      this.delay(2500, () => {
        if (this.saveAlert) this.saveAlert.close();
      });
    } else {
      // Este se cierra manualmente
      this.saveAlertType = 'danger';
      this.saveAlertMessage = 'Hubo un error al guardar la información.';
      // Timeout para que se cierre el save alert despues de 3 segundos
      this.delay(2500, () => {
        if (this.saveAlert) this.saveAlert.close();
      });
    }
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
      }, ms),
    );
  }

  changePreviewState(): void {
    this.showPreview = !this.showPreview;
  }
}
