import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RepositoriesService } from '../../services/repositories.service';

@Component({
  selector: 'app-repositorio',
  templateUrl: './repositorio.component.html',
  styleUrls: ['./repositorio.component.scss'],
})
export class RepositorioComponent implements OnInit {
  // router data
  itemId!: string;
  type!: string;
  //
  isDataLoaded: boolean = false;
  data!: any;
  constructor(
    private readonly repoSvc: RepositoriesService,
    private router: Router
  ) {
    const routerData: any = this.router.getCurrentNavigation()?.extras.state;
    this.itemId = routerData.id;
    this.type = routerData.type;
  }

  ngOnInit(): void {
    this.repoSvc
      .findOne(this.type.toLocaleLowerCase(), this.itemId)
      .subscribe((res) => {
        this.data = res;
        this.isDataLoaded = true;
      });
  }

  onDelete() {
    throw new Error('Method not implemented.');
  }
}
