import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FilesService {
    private readonly http = inject(HttpClient)
    readonly api = environment.api;

    // Returns excel file
    getVesselsServed(year: string) {
        return this.http.get(`${this.api}/files/excel/vessels-served/${year}`, {
          responseType: 'blob'
        })
    }
}
