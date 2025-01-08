import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Register } from 'src/app/interfaces/register';
import { RepositoriesService } from 'src/app/services/repositories.service';
import { firstValueFrom } from 'rxjs';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { CommonModule } from '@angular/common';
import { TonFormatPipe } from 'src/app/pipes/ton-format.pipe';

@Component({
  selector: 'app-liquidacion-embarque',
  standalone: true,
  imports: [CommonModule, TonFormatPipe],
  templateUrl: './liquidacion-embarque.component.html',
  styleUrls: ['./liquidacion-embarque.component.scss'],
})
export class LiquidacionEmbarqueComponent implements OnInit {
  routerData!: any;
  registerId!: string;
  data!: Register;
  port!: string;
  recData: any;
  blData!: any;
  ttl: any;
  isDataLoaded: boolean = false;

  // styles
  st = {
    title: {
      'font-size': '18.5px'
    },
    table: {
      'font-size': '13px'
    }
  }

  constructor(
    private readonly router: Router,
    private readonly repoSvc: RepositoriesService,
    private readonly cmnSvc: CommonFunctionsService
  ) {
    this.routerData = router.getCurrentNavigation()?.extras.state;
  }

  get flowType(): string {
    return this.cmnSvc.getFlowType(this.data.flow);
  }

  ngOnInit(): void {
    // router data
    this.registerId = this.routerData.registerId;
    this.port = this.routerData.port;
    try {
      this.pullData().then(() => {
        this.isDataLoaded = true;
        this.setTable();
      });
    } finally {
      console.log('Data Received!');
    }
  }

  setTable(): void {
    this.recData = Object.entries(
      this.data.reports[this.port].data.receiversData.receivers
    );
    this.blData = this.data.reports[this.port].data.blData.data;
    this.ttl = this.data.reports[this.port].data.blData.ttl;
  }

  async pullData(): Promise<void> {
    this.data = await firstValueFrom(
      this.repoSvc.findOne('registers', this.registerId)
    );
    console.log(this.data);
  }
}
