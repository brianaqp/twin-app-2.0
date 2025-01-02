import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CatService {
    private url = "https://cataas.com/cat"
    
    async getCat(): Promise<File> {
        // Obtener la respuesta de la API
        const response = await fetch(this.url);
        
        // Comprobar si la respuesta es exitosa
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Obtener la imagen como un Blob
        const blob = await response.blob();

        // Crear un nuevo objeto File a partir del Blob
        const file = new File([blob], 'cat.jpg', { type: blob.type });

        return file;
    }
}