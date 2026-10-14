import { Pipe, PipeTransform } from '@angular/core';

const format = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

/** Tunisian dinar amount: 1499 -> "1 499,000 DT". */
@Pipe({ name: 'tnd' })
export class TndPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return value === null || value === undefined ? '' : `${format.format(value)} DT`;
  }
}
