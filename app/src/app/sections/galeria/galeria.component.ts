import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { LocalGallery } from 'src/app/interfaces/gallery';
import { MongoBucketService } from 'src/app/services/mongo-bucket.service';
import { environment } from 'src/app/environments/environment';
import { NgbAlert, NgbAlertModule, NgbModal, NgbPopover, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Ports } from 'src/app/environments/globals';
import { CatService } from 'src/app/test/cat.service';
import { UpdateResult } from 'mongodb';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbPopoverModule,
    NgbAlertModule,
  ],
  templateUrl: './galeria.component.html',
  styleUrls: ['./galeria.component.scss'],
})
export class GaleriaComponent implements OnInit, OnDestroy {
  // Modal variables
  modalSubs!: Subscription;
  @ViewChild('img_modal') imgModal!: TemplateRef<any>;
  @ViewChild('delete_modal') deleteModal!: TemplateRef<any>;
  @ViewChild('edit_modal') editModal!: TemplateRef<any>;
  @ViewChild('copy_popover') copyPopover!: NgbPopover;
  //
  closeResult!: string;
  publicLink: string = '';
  fileSelected!: LocalGallery;
  registerId: string = '';
  localFiles: LocalGallery[] = [];
  preUploadFiles: LocalGallery[] = [];
  uploadButton: boolean = false;
  // checkbox
  checkbox: boolean = false;
  // port selection
  availablePorts = ['General', ...Ports];
  portSelected: string = 'General';
  // save alert
  saveAlertType: string = '';
  saveAlertMessage: string = '';
  @ViewChild('saveAlert') saveAlert!: NgbAlert;
  //
  constructor(
    private readonly mongoBucketSvc: MongoBucketService,
    private router: Router,
    private modalService: NgbModal,
    private catService: CatService
  ) {
    const data: any = router.getCurrentNavigation()?.extras.state;
    this.registerId = data.registerId;
    // Observador para ver los modales activos
    this.modalSubs = this.modalService.activeInstances.subscribe();
  }

  ngOnInit(): void {
    // LAB
    // this.checkbox = true;
    // this.catService.getCat().then((res) => {
    //   this.convertFileToLocalGallery(res, this.preUploadFiles, "");
    // })
    //
    console.log('On Init');
    this.pullDocsData()
      .then(docs => {
        this.pullImageWithId(docs);
        this.initVariables();
      })
      .catch(error => console.log(error));
  }

  // 1. Init Data
  async pullDocsData(): Promise<any> {
    // Retorna un arreglo con la información de cada foto en el repositorio
    return await firstValueFrom(
      this.mongoBucketSvc.getBucketFilesData(this.registerId)
    );
  }

  async pullImageWithId(docs: any[]): Promise<any> {
    // Retorna una imagen usando de parametro objectId
    for (let doc of docs) {
      console.log('pullImageWithId ->', doc);
      const arraybuff = await firstValueFrom(
        this.mongoBucketSvc.getImageWithObjectId(this.registerId, doc._id)
      );
      const file = new File([arraybuff], doc.filename, {
        type: doc.metadata.mimetype,
      });
      this.convertFileToLocalGallery(
        file,
        this.localFiles,
        doc.metadata.caption || '',
        doc.metadata.port || 'General',
        doc._id
      );
    }
  }

  // 2. Init Variables
  initVariables(): void {
    // Funcion que inicializa las variables de cada clase.
    this.publicLink = `${environment.publicApp}/gallery/${this.registerId}`;
  }

  // 3. PreUpload Files methods
  // Metodo que guarda las imagenes subidas localmente a preUploadFiles
  onFileUpload(event: any): void {
    console.log('onFileUpload ->');
    const selectedFiles: FileList = event.target.files;
    const filesArray = Object.values(selectedFiles); // Comprobar si si funciona la comprobacion
    const filteredArray = this.filterImages(filesArray);
    if (filteredArray.length >= 1) {
      filesArray.forEach(file => {
        this.convertFileToLocalGallery(file, this.preUploadFiles, '');
      });
    }
  }

  // 4. Clipboard popover methods
  async copyLink(): Promise<void> {
    // Funcion que copia el link al portapapeles usando el API de clipboard
    try {
      await navigator.clipboard.writeText(this.publicLink);
      this.copyPopover.ngbPopover = 'Link copiado al portapapeles';
      // manual close after 1s
    } catch {
      this.copyPopover.ngbPopover = 'Error al copiar el link';
    } finally {
      this.copyPopover.open();
      await this.delay(2000, () => {});
      this.copyPopover.close();
    }
  }

  deleteImage(): void {
    // Funcion que borra la imagen del file seleccionado
    console.log('onDeleteImage ->');
    this.mongoBucketSvc
      .deleteImage(this.registerId, this.fileSelected._id!)
      .subscribe(success => {
        if (success) {
          // Mensaje de borrado con exito
          this.deleteSelectedFile(this.fileSelected, this.localFiles);
        } else {
          alert('Error: Hubo un problema al borrar los archivos.');
        }
      });
  }

  /**
   * Metodo que edita envia una peticion al server para que edite
   * las propiedades del objeto IMG
   */
  editImageProperties(): void {
    const body = {
      port: this.fileSelected.port,
      caption: this.fileSelected.caption,
      _id: this.fileSelected._id
    }

    this.mongoBucketSvc.editProperties(this.registerId, body)
      .subscribe({
        next: (res: UpdateResult) => {
          switch(res.modifiedCount) {
          case 0: 
            this.showSaveAlert('El documento no se actualizo', "secondary");
            break;
          case 1:
            this.showSaveAlert('El documento se actualizo con exito', "success");
            break;
        }
      },
      error: err => {
        this.showSaveAlert('Hubo un error al guardar el documento.', "warning");
      }
    });
  }

  // Aux Methods
  filterImages(files: File[]): File[] {
    // Funcion que retorna un arreglo de files que solo sean imagenes.
    const imageRegex = /^image\/.*$/;
    return files.filter(file => imageRegex.test(file.type));
  }

  convertFileToLocalGallery(
    file: File,
    dst: LocalGallery[],
    caption: string,
    port?: string,
    _id?: string
  ): void {
    // Funcion que convierte un file recibido de un input en un objeto localGallery
    this.convertFileToBase64Url(file)
      .then(imgBase64 => {
        const obj: LocalGallery = {
          fileObject: file,
          base64url: imgBase64,
          caption: caption,
          port: port || 'General',
          _id: _id || undefined,
        };
        dst.push(obj);
      })
      .catch(e => console.log(e));
  }

  convertFileToBase64Url(file: File): Promise<string> {
    // Funcion que convierte un file en un string base64url
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(reader.error);
      };
    });
  }

  deleteSelectedFile(file: LocalGallery, dst: LocalGallery[]): void {
    // Funcion que borra del arreglo dst el objeto file
    console.log('onDeleteImage ->');
    const fileIndex = dst.indexOf(file);
    dst.splice(fileIndex, 1);
  }

  saveImage(): void {
    // Funcion que guarda las iamgenes de preUploaded en la base de datos.
    if (this.preUploadFiles.length >= 1) {
      try {
        this.uploadButton = true; // El boton se apaga para evitar dobe peticion.
        const formData = new FormData();
        this.preUploadFiles.forEach((file: LocalGallery) => {
          formData.append('files', file.fileObject);
          formData.append('captions', file.caption);
        });
        // Se agrega el puerto seleccionado
        formData.append('port', this.portSelected);
        // Enviar las imagenes al servidor
        this.mongoBucketSvc
          .postImage(formData, this.registerId)
          .subscribe((res: any) => {
            let type = '';
            res.status ? (type = 'success') : (type = 'danger');
            this.showSaveAlert(res.mssg, type);
            this.delay(1000, () => (this.uploadButton = false));
            this.transferFiles(res.files);
            this.preUploadFiles = [];
          });
      } catch (e) {
        console.log('ERROR', e);
      }
    } else {
      this.showSaveAlert('No hay imagenes que guardar', 'secondary');
    }
  }

  // Metodo que transfiere los archivos que se acaban de subir a localFiles
  transferFiles(uploadedFilesDocs: any[]): void {
    this.preUploadFiles.forEach((file: LocalGallery) => {
      // Revisa si el archivo ya existe en la base de datos
      const { name: fileName } = file.fileObject;
      const doc = uploadedFilesDocs.find(doc => doc.filename === fileName);
      // Añade el _id al objeto file
      this.convertFileToLocalGallery(
        file.fileObject,
        this.localFiles,
        doc ? doc.metadata.caption : '',
        doc ? doc.metadata.port : 'General',
        doc ? doc._id : undefined
      );
    });
  }

  // Modal Methods
  onImgModalOpen(file: LocalGallery, category: string): void {
    // Funcion que abre el modal de la imagen
    // Comprobacion para cambiar la variable fileSelected
    if (file) {
      this.fileSelected = file;
    }
    // Configuracion del modal
    this.modalService.open(this.imgModal, {
      centered: true,
      keyboard: true,
      fullscreen: 'lg',
    });
  }

  onDeleteModalOpen(): void {
    // Funcion que abre el modal para confirmar el borrado de la imagen
    const modalRef = this.modalService.open(this.deleteModal, {
      centered: true,
    });
    modalRef.result.then(
      result => {
        if (result === 'confirm') {
          // Borrar la imagen
          this.deleteImage();
          //Cerrar todos los modales
          this.modalService.dismissAll();
        }
      },
      reason => {
        // No hacer nada
      }
    );
  }

  /**
   * Metodo que abre un modal capaz de modificar las 
   * propiedades editables de la imagen.
   */
  onEditImg() {
    const modalRef = this.modalService.open(this.editModal, {
      centered: true
    }); 
    

    modalRef.result.then(
      result => {
        if (result === 'confirm') {
          // Edit img
          this.editImageProperties();
          // Close modal
          this.modalService.dismissAll();     
        }
      },
      reason => {
        // pass
      }
    );
  }

   /**
   * Convierte un archivo en una cadena base64url.
   * Si `this.checkbox` es `true`, se dibuja una marca de agua.
   * 
   * @param {File} file - Tipo File.
   * @returns {Promise<string>} - Promesa que se resuelve con la cadena base64url.
   */
  addWaterFontToImg(): void {
  }

  // -------- Metodos del alert de guardado
  // Metodo que muesta un mensaje de exito o error
  showSaveAlert(message: string, type: string): void {
    this.saveAlertType = type;
    this.saveAlertMessage = message;
    this.delay(3000, () => {
      if (this.saveAlert) this.saveAlert.close();
    });
  }

  onSaveAlertClose(): void {
    this.saveAlertMessage = '';
    this.saveAlertType = '';
  }

  // async timeout que recibe un callback
  async delay(ms: number, callback: () => void): Promise<void> {
    return new Promise(resolve =>
      setTimeout(() => {
        callback();
        resolve();
      }, ms)
    );
  }

  // DOM Methods
  checkIfSectionShow(category: string): boolean {
    return this.localFiles.some(file => file.port === category);
  }

  getFilesByCategory(category: string): LocalGallery[] {
    return this.localFiles.filter(file => file.port === category);
  }

  ngOnDestroy(): void {
    this.modalSubs.unsubscribe();
  }
}
