import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { InsertOneResult, UpdateResult } from 'mongodb';
import { ApiError } from '../interfaces/api-error';

@Injectable({
  providedIn: 'root',
})
export class RepositoriesService {
  private baseUrl = `${environment.apiUrl}/repositories`;
  constructor(private readonly http: HttpClient) {}

  // ------------------- GET METHODS -------------------
  find(collection: string, projection?: object): Observable<any> {
    // Funcion que devuelve todos los registros de una coleccion
    return this.http.get<any>(`${this.baseUrl}/${collection}`, {
      params: {
        ...projection,
      },
    });
  }

  findOne(
    collection: string,
    id: string,
    projection?: object
  ): Observable<any> {
    // Funcion que devuelve un registro de una coleccion
    return this.http.get<any>(`${this.baseUrl}/${collection}/findOne/${id}`, {
      params: {
        ...projection,
      },
    });
  }

  getLatestRegisterCount(collection: string): Observable<any> {
    // Funcion que devuelve el ultimo registro de una coleccion
    return this.http.get<any>(
      `${this.baseUrl}/${collection}/getLastRegisterCount`
    );
  }

  // Metodo que devuelve un arreglo de strings de un campo en particular
  getDistinctField(collection: string, field: string): Observable<any> {
    // Field necesita enviarse como string y usando _ para separar palabras.
    return this.http.get<any>(
      `${this.baseUrl}/${collection}/getField/${field}`
    );
  }

  // Metodo que devuelve un arreglo de strings de las razones sociales de los registros.
  getSocialReasons(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/registers/getSocialReasons`);
  }

  getDocsByYear(collection: string, year: string): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/${collection}/getDocsByYear/${year}`
    );
  }

  // ------------------- POST METHODS -------------------
  insertOne(collection: string, item: any): Observable<InsertOneResult> {
    const body = item;
    return this.http.post<any>(`${this.baseUrl}/${collection}/insertOne`, body);
  }

  // testing get route
  getTest(collection: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${collection}/test`);
  }

  // ------------------- PUT METHODS -------------------
  updateOne(
    collection: string,
    item: any,
    upsert?: boolean
  ): Observable<UpdateResult> {
    // Funcion que actualiza un registro de una coleccion
    if (upsert == undefined) upsert = false;
    const body = {
      item: item,
      upsert: upsert,
    };
    return this.http.put<any>(
      `${this.baseUrl}/${collection}/${body.item.id}`,
      body
    );
  }

  associeteRegisterWithVessel(id: string, registerId: string) {
    const body = { id: registerId };
    return this.http.put<UpdateResult>(
      `${this.baseUrl}/vessels/${id}/registers`,
      body
    );
  }

  updateTimes(collection: string, item: any): Observable<any> {
    const body = item;
    return this.http.put<any>(
      `${this.baseUrl}/${collection}/updateTimes/${body.id}`,
      body
    );
  }

  // ------------------- DELETE METHODS -------------------
  deleteOne(collection: string, id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${collection}/${id}`);
  }
}
