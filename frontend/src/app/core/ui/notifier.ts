import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { errorMessage } from '../http/problem-detail';

/** Short toast messages at the bottom of the screen. */
@Injectable({ providedIn: 'root' })
export class Notifier {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.snackBar.open(message, 'OK', { duration: 3000, panelClass: 'snack-success' });
  }

  error(errorOrMessage: unknown): void {
    const message = typeof errorOrMessage === 'string' ? errorOrMessage : errorMessage(errorOrMessage);
    this.snackBar.open(message, 'Fermer', { duration: 6000, panelClass: 'snack-error' });
  }
}
