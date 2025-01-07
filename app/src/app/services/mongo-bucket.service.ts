import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MongoBucketService {
  api = environment.apiUrl + '/gallery';
  registerId = 'id';
  constructor(private readonly http: HttpClient) {}

  postImage(formData: FormData, id: string): Observable<void> {
    return this.http.post<any>(`${this.api}/${id}`, formData, {
      headers: {
        enctype: 'multipart/form-data',
      },
    });
  }

  getBucketFilesData(id: string): Observable<any> {
    // Función que retorna la información de las fotos de este repositorio.
    return this.http.get<any>(`${this.api}/${id}/getBucketFilesData`);
  }

  getImageWithObjectId(id: string, objectId: string): Observable<ArrayBuffer> {
    const httpOptions: Object = {
      headers: new HttpHeaders({
        Accept: 'text/html',
        'Content-Type': 'text/plain; charset=utf-8',
      }),
      responseType: 'arraybuffer',
    };
    return this.http.get<any>(`${this.api}/${id}/${objectId}`, httpOptions);
  }

  deleteImage(id: string, objectId: string): Observable<any> {
    return this.http.delete(`${this.api}/${id}/${objectId}`);
  }

  editProperties(id: string, body: object) {
    return this.http.post<any>(`${this.api}/editProperties/${id}`, body);
  }

  deleteBucket(registerId: string): Observable<any> {
    return this.http.delete(`${this.api}/deleteBucket/${registerId}`);
  }
}
