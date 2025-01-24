import { Component, OnInit } from '@angular/core';
import { RepositoriesService } from '../services/repositories.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CardListComponent } from '../widgets/card-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CardListComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  selection: 'registers' | 'vessels' = 'registers';
  selectionOptions: ['registers', 'vessels'] = ['registers', 'vessels'];
  data!: object;
  registerList: object[] = [];
  vesselList: object[] = [];
  listToExport!: any;
  isDataLoaded = false;
  constructor(private readonly repoSvc: RepositoriesService) {}

  ngOnInit(): void {
    this.pullData().then(() => {
      this.initVariables();
      this.isDataLoaded = true;
    });
  }

  async pullData(): Promise<void> {
    const projection = {
      registers: {
        id: 1,
        vesselId: 1,
      },
      vessels: {
        id: 1,
        'shipParticulars.name': 1,
      },
    };

    this.data = {
      registers: await firstValueFrom(
        this.repoSvc.find('registers', projection['registers']),
      ),
      vessels: await firstValueFrom(
        this.repoSvc.find('vessels', projection['vessels']),
      ),
    };
  }

  initVariables(): void {
    this.data['registers'].forEach((register) => {
      const vesselLinked = this.data['vessels'].find(
        (item) => item.id == register.vesselId,
      );
      //
      this.registerList.push({
        id: register.id,
        name: vesselLinked.shipParticulars.name,
      });
    });
    //
    this.data['vessels'].forEach((vessel) => {
      //
      this.vesselList.push({
        id: vessel.id,
        name: vessel.shipParticulars.name,
      });
    });
    this.listToExport = {
      registers: this.registerList,
      vessels: this.vesselList,
    };
  }

  onSearch(event: any) {
    this.busqueda.set(event.target.value);
  }

  // Metodo que se ejecuta cuando se selecciona un elemento del dropdown, y cambiar el tipo de busqueda
  onSearchTypeChange(newType: 'id' | 'name'): void {
    if (this.searchType !== newType) this.searchType = newType;
    this.input.nativeElement.focus();
  }

  onListChanged(collection: 'registers' | 'vessels'): void {
    if (this.selection !== collection) {
      this.selection = collection;
    }
  }
}
