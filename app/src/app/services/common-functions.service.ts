import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CommonFunctionsService {
  sumToStrings(a: string, b: string): string {
    const aInValue = this.convertStringToFloat(a);
    const bInValue = this.convertStringToFloat(b);
    const resultado = aInValue + bInValue;
    return this.getTonFormat(resultado);
  }

  convertStringToFloat(value: string): number {
    const regex = /[^-?\d+(\.\d+)?]/g;
    const onlyDecimal = value.replace(regex, '');
    const valueInFloat = parseFloat(onlyDecimal);
    return Number.isNaN(valueInFloat) ? 0 : valueInFloat;
  }

  getTonFormat(value: number): string {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  }

  getFlowString(flow: string): string {
    // Retorna el acto de carga o descarga dependiendo del flujo
    switch (flow) {
      case 'Importacion':
        return 'Discharged';
      case 'Exportacion':
        return 'Loaded';
      default:
        return '***';
    }
  }

  getFlowType(flow: string): string {
    // Retorna el rol
    switch (flow) {
      case 'Importacion':
        return 'Receivers';
      case 'Exportacion':
        return 'Shippers';
      default:
        return '***';
    }
  }
}
