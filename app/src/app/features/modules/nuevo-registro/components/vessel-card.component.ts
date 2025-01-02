import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Vessel } from 'src/app/interfaces/vessel';

@Component({
  selector: 'app-vessel-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vessel-card.component.html',
  styleUrls: ['./vessel-card.component.scss'],
})
export class VesselCardComponent {
  @Input() vesselList!: Vessel[];
  @Input() editMode = false;
  selection: any = '';
  busqueda: string = '';
  private maxItems: number = 3;

  filtrarLista(): any {
    // Funcion que reordena la lista de barcos en base a la busqueda y al puerto seleccionado
    // 1. Se crea un varible que contendra la lista y sus movimientos
    let listaFiltrada: Vessel[] = [];
    // 2. Si hay una busqueda, solo eso se devuelve
    if (this.busqueda.length >= 1) {
      listaFiltrada = this.vesselList.filter((vessel) =>
        vessel.shipParticulars.name
          .trim()
          .toLowerCase()
          .includes(this.busqueda.trim().toLowerCase())
      );
    } else {
      // 3. Si no hay busqueda, se devuelve la lista completa
      listaFiltrada = this.vesselList;
      // A continuacion se ordena la lista en base al puerto seleccionado
      listaFiltrada.sort((a, b) => {
        if (a.id === this.selection.id) {
          return -1;
        } else if (b.id === this.selection.id) {
          return 1;
        } else {
          return 0;
        }
      });
    }
    // 4. Se devuelve la lista filtrada por maxItems
    if (listaFiltrada.length > this.maxItems) {
      listaFiltrada = listaFiltrada.slice(0, this.maxItems);
    }
    return listaFiltrada;
  }

  selectFromEdit(id: string): void {
    // Funcion que se ejecuta cuando se selecciona
    this.selection = this.vesselList.find((vessel) => vessel.id === id);
  }

  onClick(vessel: any): void {
    if (this.selection === vessel) {
      this.selection = '';
    } else {
      this.selection = vessel;
    }
  }
}
