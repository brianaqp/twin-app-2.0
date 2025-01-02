import { Pipe, PipeTransform } from '@angular/core';

// PIPE que transforma un string a un número con formato de miles y 3 decimales

@Pipe({
  name: 'tonFormat',
})
export class TonFormatPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): string {
    try {
      // Si el valor es nulo, indefinido o '', no se muestra nada.
      if (!value) {
        return '';
      }

      const floatValue = this.convertStringToFloat(value);

      return floatValue.toLocaleString('en-US', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
    } catch (error) {
      console.error('Error en el pipe TonFormat', error);
      return '';
    }
  }

  private convertStringToFloat(value: string): number {
    const regex = /[^-?\d+(\.\d+)?]/g;
    const onlyDecimal = value.replace(regex, '');
    const valueInFloat = parseFloat(onlyDecimal);
    return Number.isNaN(valueInFloat) ? 0 : valueInFloat;
  }
}
