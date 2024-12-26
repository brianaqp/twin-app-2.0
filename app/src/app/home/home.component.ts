import { Component, OnInit } from '@angular/core';
import { RepositoriesService } from '../services/repositories.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RegisterCardComponent } from './components/card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RegisterCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  selection = 'Registers';
  data!: object;
  registerList: object[] = [];
  vesselList: object[] = [];
  listToExport!: any;
  isDataLoaded = false;
  constructor(private readonly repoSvc: RepositoriesService) {}

  ngOnInit(): void {
    console.log('On Init');
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
        this.repoSvc.find('registers', projection['registers'])
      ),
      vessels: await firstValueFrom(
        this.repoSvc.find('vessels', projection['vessels'])
      ),
    };
  }

  initVariables(): void {
    this.data['registers'].forEach((register) => {
      const vesselLinked = this.data['vessels'].find(
        (item) => item.id == register.vesselId
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

  onListChanged(collection: string): void {
    if (this.selection !== collection) {
      this.selection = collection;
    }
  }
}
