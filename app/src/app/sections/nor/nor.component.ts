import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Vessel } from '../../interfaces/vessel';
import { Recibidor, Register } from '../../interfaces/register';
import { RepositoriesService } from '../../services/repositories.service';
import { CommonFunctionsService } from '../../services/common-functions.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-nor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './nor.component.html',
  styleUrls: ['./nor.component.scss'],
})
export class NorComponent implements OnInit {
  isDataLoaded: boolean = false;
  routerData!: any;
  vessel!: Vessel;
  register!: Register;
  workingPort!: string;
  //
  agenteAduanal!: string;
  razonSocial!: string;
  vesselName!: string;
  arrivalDate = 'Arrrival Date';
  ton!: string;
  cargo!: string;
  norDateTendered = 'Nor Date';
  norDatePresented = 'Nor Date';
  //
  receiverIdSelected: string = 'default';
  receiversGroup!: any;
  currentDate = new Date();

  constructor(
    private readonly router: Router,
    private readonly repoSvc: RepositoriesService,
    private cmnSvc: CommonFunctionsService
  ) {
    this.routerData = router.getCurrentNavigation()?.extras.state;
  }

  ngOnInit(): void {
    if (this.routerData) {
      // init variables
      this.workingPort = this.routerData.workingPort;
      // pull data
      this.pullData()
        .then(() => {
          this.loadVariables();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  async pullData(): Promise<void> {
    const projection = {
      _id: 0,
      shipParticulars: 1,
    };
    this.vessel = await firstValueFrom(
      this.repoSvc.findOne('vessels', this.routerData.vesselId)
    );
    this.register = await firstValueFrom(
      this.repoSvc.findOne('registers', this.routerData.registerId)
    );

    if (this.vessel && this.register) {
      this.isDataLoaded = true;
    }
  }

  loadVariables(): void {
    // Vessel name
    this.vesselName = this.vessel.shipParticulars.name;
    // Dates
    this.norDateTendered =
      this.register.reports[this.workingPort].data.norTendered;
    this.norDatePresented =
      this.register.reports[this.workingPort].data.norPresented;
    // Receivers in Group
    this.receiversGroup = this.getRecGroup();
  }

  getRecGroup(): object {
    const recGrouped = {};

    const recReference =
      this.register.reports[this.workingPort].data.receiversData.receivers;

    // Agrupar y sumar tonelajes directamente
    recReference.forEach((rec) => {
      const tonelaje = this.cmnSvc.convertStringToFloat(rec.tonelaje);
      const producto = rec.producto;

      if (!recGrouped[rec.name]) {
        recGrouped[rec.name] = [];
      }

      const existingProduct = recGrouped[rec.name].find(
        (item) => item.producto === producto
      );

      if (existingProduct) {
        existingProduct.tonelaje += tonelaje;
      } else {
        recGrouped[rec.name].push({ producto, tonelaje });
      }
    });

    // Formatear tonelajes
    for (const i in recGrouped) {
      recGrouped[i].forEach((item) => {
        item.tonelaje = item.tonelaje.toLocaleString('en-US');
      });
    }

    return recGrouped;
  }

  get receivers() {
    // Funcion getter que retorna un arreglo de objetos con los atributos id y name,
    // para que el select pueda iterar sobre el arreglo, y antes de retornar, se va a filtrar
    // para que no se repitan los atributos name
    const receivers =
      this.register.reports[this.workingPort].data.receiversData.receivers;

    // Arreglo de objetos con los atributos id y name
    const data = receivers.map((item: Recibidor) => {
      return {
        id: item.id,
        name: item.name,
      };
    });

    // Filtra el arreglo para que no se repitan los atributos name
    return data.filter((value, index, self) => {
      return self.findIndex((v) => v.name === value.name) === index;
    });
  }

  receiverSelectedChange(): void {
    // Funcion que se ejecuta cuando el usuario selecciona un recibidor
    if (this.receiverIdSelected != 'default') {
      const dataRef =
        this.register.reports[this.workingPort].data.receiversData.receivers;

      const receiver = dataRef.find((item: Recibidor) => {
        return item.id === this.receiverIdSelected;
      });

      this.agenteAduanal = receiver!.agenteAduanal;
      this.razonSocial = receiver!.razonSocial;
    }
  }

  chargeOrDischarge(): string {
    if (this.register.flow === 'Importacion') {
      return 'Discharge';
    }
    if (this.register.flow === 'Exportacion') {
      return 'Load';
    }
    return '*****';
  }

  getCargoAndProducts(): string {
    // Funcion que retorna un parrafo con el tonelaje y producto de cada receividor.
    let paragraph = '';
    if (this.receiverIdSelected != 'default') {
      const dataRef =
        this.register.reports[this.workingPort].data.receiversData.receivers;

      const receiver = dataRef.find((item: Recibidor) => {
        return item.id === this.receiverIdSelected;
      });

      this.receiversGroup[receiver!.name].forEach((item: any) => {
        paragraph += `${item.tonelaje} tons of ${item.producto}, `;
      });
      return paragraph;
    }
    return '';
  }

  async printPDF(): Promise<void> {
    window.print();
  }
}
