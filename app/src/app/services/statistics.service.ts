import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { chartData, chartRequest } from '../interfaces/statistics';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private readonly apiBaseUrl = environment.api;

  constructor(private readonly http: HttpClient) {}

  // here
  insertOne(collection: string, item: any): Observable<any> {
    const body = item;
    return this.http.post<any>(`${this.apiBaseUrl}/${collection}`, body);
  }

  findOne(
    collection: string,
    id: string,
    projection?: object,
  ): Observable<any> {
    // Funcion que devuelve un registro de una coleccion
    return this.http.get<any>(`${this.apiBaseUrl}/${collection}/${id}`, {
      params: {
        ...projection,
      },
    });
  }

  updateOne(collection: string, item: any, upsert?: boolean): Observable<any> {
    // Funcion que actualiza un registro de una coleccion
    if (upsert == undefined) upsert = false;
    const body = {
      item: item,
      upsert: upsert,
    };
    return this.http.put<any>(
      `${this.apiBaseUrl}/${collection}/${body.item.id}`,
      body,
    );
  }

  deleteOne(collection: string, id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiBaseUrl}/${collection}/${id}`);
  }

  getMaxId(collection: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiBaseUrl}/${collection}/max-id/`,
      null,
    );
  }

  getDataByYear(year: string, projection?: object): Observable<any> {
    return this.http.get<any>(this.apiBaseUrl + `/statistics/year/${year}`, {
      params: {
        ...projection,
      },
    });
  }

  //////Datos para graficas

  async getCargoTonnageRecord(body: chartRequest): Promise<Array<chartData>> {
    try {
      return await firstValueFrom(
        this.http.post<Array<chartData>>(
          `${this.apiBaseUrl}/statistics/reports/cargo/month`,
          body,
        ),
      );
    } catch (error) {
      console.error('Error al obtener los datos de tonelaje de carga:', error);
      return []; // Retorna un arreglo vacío en caso de error
    }
  }

  async getImportersRecord(body: chartRequest): Promise<Array<chartData>> {
    try {
      return await firstValueFrom(
        this.http.post<Array<chartData>>(
          `${this.apiBaseUrl}/statistics/reports/importer/month`,
          body,
        ),
      );
    } catch (error) {
      console.error(
        'Error al obtener los datos de tonelaje de importadores:',
        error,
      );
      return []; // Retorna un arreglo vacío en caso de error
    }
  }

  async getTradersRecord(body: chartRequest): Promise<Array<chartData>> {
    try {
      return await firstValueFrom(
        this.http.post<Array<chartData>>(
          `${this.apiBaseUrl}/statistics/reports/trader/month`,
          body,
        ),
      );
    } catch (error) {
      console.error(
        'Error al obtener los datos de tonelaje de Traders:',
        error,
      );
      return []; // Retorna un arreglo vacío en caso de error
    }
  }

  async getDischPortRecord(body: chartRequest): Promise<Array<chartData>> {
    try {
      return await firstValueFrom(
        this.http.post<Array<chartData>>(
          `${this.apiBaseUrl}/statistics/reports/dischargingPort/month`,
          body,
        ),
      );
    } catch (error) {
      console.error('Error al obtener los datos de tonelaje de Ports:', error);
      return []; // Retorna un arreglo vacío en caso de error
    }
  }

  async getCountryRecord(body: chartRequest): Promise<Array<chartData>> {
    try {
      return await firstValueFrom(
        this.http.post<Array<chartData>>(
          `${this.apiBaseUrl}/statistics/reports/country/month`,
          body,
        ),
      );
    } catch (error) {
      console.error(
        'Error al obtener los datos de tonelaje de country:',
        error,
      );
      return []; // Retorna un arreglo vacío en caso de error
    }
  }

  ////Datos para tablas mensuales

  async getCargoRecordTableM(body: any): Promise<Array<any>> {
    try {
      return await firstValueFrom(
        this.http.post<Array<any>>(
          `${this.apiBaseUrl}/statistics/reports/table/cargo/month`,
          body,
        ),
      );
    } catch (error) {
      console.error(
        'Error al obtener los datos de tonelaje de country:',
        error,
      );
      return []; // Retorna un arreglo vacío en caso de error
    }
  }

  async getImporterRecordTableM(body: any): Promise<Array<any>> {
    try {
      return await firstValueFrom(
        this.http.post<Array<any>>(
          `${this.apiBaseUrl}/statistics/reports/table/importer/month`,
          body,
        ),
      );
    } catch (error) {
      console.error(
        'Error al obtener los datos de tonelaje de country:',
        error,
      );
      return []; // Retorna un arreglo vacío en caso de error
    }
  }

  async getTraderRecordTableM(body: any): Promise<Array<any>> {
    try {
      return await firstValueFrom(
        this.http.post<Array<any>>(
          `${this.apiBaseUrl}/statistics/reports/table/trader/month`,
          body,
        ),
      );
    } catch (error) {
      console.error(
        'Error al obtener los datos de tonelaje de country:',
        error,
      );
      return []; // Retorna un arreglo vacío en caso de error
    }
  }

  async getDischargingPortRecordTableM(body: any): Promise<Array<any>> {
    try {
      return await firstValueFrom(
        this.http.post<Array<any>>(
          `${this.apiBaseUrl}/statistics/reports/table/dischargingPort/month`,
          body,
        ),
      );
    } catch (error) {
      console.error(
        'Error al obtener los datos de tonelaje de country:',
        error,
      );
      return []; // Retorna un arreglo vacío en caso de error
    }
  }

  async getCountryRecordTableM(body: any): Promise<Array<any>> {
    try {
      return await firstValueFrom(
        this.http.post<Array<any>>(
          `${this.apiBaseUrl}/statistics/reports/table/country/month`,
          body,
        ),
      );
    } catch (error) {
      console.error(
        'Error al obtener los datos de tonelaje de country:',
        error,
      );
      return []; // Retorna un arreglo vacío en caso de error
    }
  }

  ////Datos para tablas trimestrales

  async getCargoRecordTableT(body: any): Promise<Array<any>> {
    try {
      return await firstValueFrom(
        this.http.post<Array<any>>(
          `${this.apiBaseUrl}/statistics/reports/table/cargo/trim`,
          body,
        ),
      );
    } catch (error) {
      console.error(
        'Error al obtener los datos de tonelaje de country:',
        error,
      );
      return []; // Retorna un arreglo vacío en caso de error
    }
  }

  async getImporterRecordTableT(body: any): Promise<Array<any>> {
    try {
      return await firstValueFrom(
        this.http.post<Array<any>>(
          `${this.apiBaseUrl}/statistics/reports/table/importer/trim`,
          body,
        ),
      );
    } catch (error) {
      console.error(
        'Error al obtener los datos de tonelaje de country:',
        error,
      );
      return []; // Retorna un arreglo vacío en caso de error
    }
  }

  async getTraderRecordTableT(body: any): Promise<Array<any>> {
    try {
      return await firstValueFrom(
        this.http.post<Array<any>>(
          `${this.apiBaseUrl}/statistics/reports/table/trader/trim`,
          body,
        ),
      );
    } catch (error) {
      console.error(
        'Error al obtener los datos de tonelaje de country:',
        error,
      );
      return []; // Retorna un arreglo vacío en caso de error
    }
  }

  async getDischargingPortRecordTableT(body: any): Promise<Array<any>> {
    try {
      return await firstValueFrom(
        this.http.post<Array<any>>(
          `${this.apiBaseUrl}/statistics/reports/table/dischargingPort/trim`,
          body,
        ),
      );
    } catch (error) {
      console.error(
        'Error al obtener los datos de tonelaje de country:',
        error,
      );
      return []; // Retorna un arreglo vacío en caso de error
    }
  }

  async getCountryRecordTableT(body: any): Promise<Array<any>> {
    try {
      return await firstValueFrom(
        this.http.post<Array<any>>(
          `${this.apiBaseUrl}/statistics/reports/table/country/trim`,
          body,
        ),
      );
    } catch (error) {
      console.error(
        'Error al obtener los datos de tonelaje de country:',
        error,
      );
      return []; // Retorna un arreglo vacío en caso de error
    }
  }

  async getRecordTableM(body: any): Promise<Array<any>> {
    try {
      return await firstValueFrom(
        this.http.post<Array<any>>(
          `${this.apiBaseUrl}/statistics/reports/table/cargo/month`,
          body,
        ),
      );
    } catch (error) {
      console.error(
        'Error al obtener los datos de tonelaje de country:',
        error,
      );
      return []; // Retorna un arreglo vacío en caso de error
    }
  }
}
