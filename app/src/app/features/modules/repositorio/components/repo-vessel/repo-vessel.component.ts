import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Vessel } from '../../../../interfaces/vessel';
import { RepositoriesService } from '../../../../services/repositories.service';

@Component({
  selector: 'app-repo-vessel',
  templateUrl: './repo-vessel.component.html',
  styleUrls: ['./repo-vessel.component.scss'],
})
export class RepoVesselComponent {
  @Input() vesselData!: Vessel;
  constructor(
    private readonly repoSvc: RepositoriesService,
    private location: Location
  ) {}

  onDeleteVessel(): void {
    if (this.vesselData.registers.length >= 1) {
      alert(
        `Borrar un Vessel equivale a borrar la base de un registro. Primero debes borrar los siguientes Registros para borrar el Vessel: ${this.vesselData.registers}`
      );
      return;
    }
    const result = window.confirm(
      '¿Estás seguro de que deseas eliminar este elemento?'
    );
    if (result) {
      // Si confirmo, se borrara
      this.repoSvc.deleteOne('vessels', this.vesselData.id).subscribe((res) => {
        if (res.deletedCount) {
          this.location.back();
        } else {
          alert('Hubo un error y no se puedo borrar...');
        }
      });
    }
  }
}
