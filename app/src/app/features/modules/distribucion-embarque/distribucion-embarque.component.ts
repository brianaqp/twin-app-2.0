import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Register } from '../../interfaces/register';
import { RepositoriesService } from '../../services/repositories.service';
import { CommonFunctionsService } from '../../services/common-functions.service';

@Component({
  selector: 'app-distribucion-embarque',
  templateUrl: './distribucion-embarque.component.html',
  styleUrls: ['./distribucion-embarque.component.scss'],
})
export class DistribucionEmbarqueComponent implements OnInit {
  routerData!: any;
  data!: Register;
  form!: FormGroup;
  test!: any;
  tonelajeTotal: string = '0';
  isDataLoaded: boolean = false;

  // style variables
  st = {
    title: {
      'font-size': '18.5px',
      'font-weight': '500',
    },
  };
  tableStyles =
    'width: 215mm; border-collapse: collapse; margin-top: 10px; font-size: 13px;';
  cellStyles = 'border: 1px solid black; padding-left: 8px; text-align: left;';

  constructor(
    private readonly router: Router,
    private readonly repoSvc: RepositoriesService,
    private readonly fb: FormBuilder,
    private cmnSvc: CommonFunctionsService
  ) {
    this.routerData = router.getCurrentNavigation()?.extras.state;
  }

  get flowType(): string {
    return this.cmnSvc.getFlowType(this.data.flow);
  }

  ngOnInit(): void {
    this.pullData(this.routerData.registerId).then(() => {
      this.isDataLoaded = true;
      this.initVariables();
    });
  }

  async pullData(id: string): Promise<void> {
    const projection = {
      reports: 1,
      recibidores: 1,
      flow: 1,
      id: 1,
      workingPorts: 1,
      stowagePlan: 1,
    };
    this.data = await firstValueFrom(
      this.repoSvc.findOne('registers', id, projection)
    );
  }

  initVariables(): void {
    let newTotal = 0;
    for (let port of this.data.workingPorts) {
      const portTotal = this.data.reports[port].data.receiversData.total;
      const floatValue = this.cmnSvc.convertStringToFloat(portTotal);
      newTotal += floatValue;
    }
    this.tonelajeTotal = this.cmnSvc.getTonFormat(newTotal);
  }

  getBlData(id: string, category: string, port: string): string {
    let value = '';

    this.data.reports[port].data.blData.data.map((item, index) => {
      if (item.id === id) {
        // @ts-ignore
        value = this.data.reports[port].data.blData.data[index][category];
        return;
      }
    });
    return value;
  }

  async print(): Promise<void> {
    window.print();
  }
}
