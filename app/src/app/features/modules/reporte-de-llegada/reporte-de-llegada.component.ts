import { Component, OnInit } from '@angular/core';
import { Vessel } from 'src/app/interfaces/vessel';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reporte-de-llegada',
  templateUrl: './reporte-de-llegada.component.html',
  styleUrls: ['./reporte-de-llegada.component.scss'],
})
export default class ReporteDeLlegadaComponent implements OnInit {
  register!: any;
  vessel!: Vessel;
  routerData!: any;
  shipParticulars!: any;
  destinatariosRows!: any;
  constructor(private router: Router) {
    this.routerData = this.router.getCurrentNavigation()?.extras.state;
  }

  ngOnInit(): void {
    this.register = this.routerData.data;
    this.vessel = this.routerData.vesselData;
    this.initializedVariables();
  }

  initializedVariables(): void {
    this.shipParticulars = Object.entries(this.vessel.shipParticulars);
    // zona de los destinatarios
    // variables
    const rows: any = [];
    let i = 0;
    let tempData: any = [];
    const lastItem = this.register.destinatarios.at(-1);
    // algoritmo
    for (let destinatario of this.register.destinatarios) {
      tempData.push(destinatario);
      i += 1;
      if (i >= 2 || destinatario === lastItem) {
        rows.push(tempData);
        i = 0;
        tempData = [];
      }
      this.destinatariosRows = rows;
    }
  }
}
