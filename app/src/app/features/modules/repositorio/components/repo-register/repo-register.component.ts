import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Register } from '../../../../interfaces/register';
import { Vessel } from '../../../../interfaces/vessel';
import { PortColors } from '../../../../environments/globals';
import { RepositoriesService } from '../../../../services/repositories.service';
import { MongoBucketService } from '../../../../services/mongo-bucket.service';

@Component({
  selector: 'app-repo-register',
  templateUrl: './repo-register.component.html',
  styleUrls: ['./repo-register.component.scss'],
})
export class RepoRegisterComponent implements OnInit {
  @Input() register!: Register;
  vessel!: Vessel;
  isDataLoaded: boolean = false;
  PortColors = PortColors;

  constructor(
    private readonly repoSvc: RepositoriesService,
    private readonly mongoBucketSvc: MongoBucketService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.repoSvc.findOne('vessels', this.register.vesselId).subscribe((res) => {
      this.vessel = res;
      this.isDataLoaded = true;
    });
  }

  // DOM methods
  getPortColor(port: string) {
    const formattedPort = port.toLowerCase().replace(/\s+/g, '');
    // NOTE : PATCHED color for extra ports
    return PortColors[formattedPort] || '#e4fde1';
  }

  onDeleteRegister(): void {
    // Resultado del dialogo de informacion
    const result = window.confirm(
      '¿Estás seguro de que deseas eliminar este elemento?'
    );
    if (result) {
      this.repoSvc.deleteOne('registers', this.register.id).subscribe((res) => {
        if (res.deletedCount) {
          this.updateVesselRegisters();
          this.deleteGalleryBucket();
          this.location.back();
        } else {
          alert('Hubo un error y no se puedo borrar...');
        }
      });
    }
  }

  deleteGalleryBucket(): void {
    // Funcion que borra el bucket de grifs perteneciente a este repositorio.
    this.mongoBucketSvc.deleteBucket(this.register.id).subscribe();
  }

  updateVesselRegisters(): void {
    // Funcion que borra del objeto Vessel, el registro borrado
    // Encuentra el índice del elemento a eliminar
    const indiceAEliminar = this.vessel.registers.indexOf(this.register.id);
    // Verifica si el elemento existe en el arreglo antes de eliminarlo
    if (indiceAEliminar !== -1) {
      this.vessel.registers.splice(indiceAEliminar, 1); // Elimina el elemento del arreglo
    }
    this.repoSvc.updateOne('vessels', this.vessel).subscribe((res) => {});
  }
}
