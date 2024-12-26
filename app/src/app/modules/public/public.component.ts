import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { LocalGallery } from 'src/app/interfaces/gallery';
import { CommonFunctionsService } from 'src/app/services/common-functions.service';
import { MongoBucketService } from 'src/app/services/mongo-bucket.service';

@Component({
  selector: 'app-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss'],
})
export default class PublicComponent implements OnInit {
  localFiles: LocalGallery[] = [];
  constructor(
    private route: ActivatedRoute,
    private mongoBucketSvc: MongoBucketService,
    private cmnSvc: CommonFunctionsService
  ) {}
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id')!;
      this.pullDocsData(id).then(docs => {
        if (docs.length >= 1) {
          this.pullImageWithId(docs, id);
        } else {
          console.log('Not files yet');
        }
      });
    });
  }

  async pullDocsData(id: string): Promise<any> {
    // Retorna un arreglo con la información de cada foto en el repositorio
    return await firstValueFrom(this.mongoBucketSvc.getBucketFilesData(id));
  }

  async pullImageWithId(docs: any[], id: string): Promise<any> {
    // Retorna una imagen usando de parametro objectId
    for (let doc of docs) {
      const arraybuff = await firstValueFrom(
        this.mongoBucketSvc.getImageWithObjectId(id, doc._id)
      );
      const file = new File([arraybuff], doc.filename, {
        type: doc.metadata.mimetype,
      });
      this.convertFilesToLocalGallery(file, this.localFiles, doc._id);
    }
  }

  convertFilesToLocalGallery(
    file: File,
    dst: LocalGallery[],
    _id?: string
  ): void {
    // Que esta funcion trabaje con un solo documento
    // Es decir, que el forEach este fuera.
    this.cmnSvc.convertFileToBase64Url(file)
      .then(imgBase64 => {
        const obj: LocalGallery = {
          fileObject: file,
          base64url: imgBase64,
        };
        if (_id) {
          obj._id = _id;
        }
        dst.push(obj);
      })
      .catch(e => console.log(e));
  }
}
