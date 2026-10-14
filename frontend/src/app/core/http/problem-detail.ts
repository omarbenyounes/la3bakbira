import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormGroup } from '@angular/forms';

/** RFC 9457 body returned by the backend for 4xx/5xx errors. */
export interface ProblemDetail {
  status?: number;
  title?: string;
  detail?: string;
  errors?: Record<string, string>;
}

function problemOf(error: unknown): ProblemDetail | null {
  if (error instanceof HttpErrorResponse && error.error && typeof error.error === 'object') {
    return error.error as ProblemDetail;
  }
  return null;
}

/** Human-readable message (French) for any HTTP error. */
export function errorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Une erreur inattendue est survenue.';
  }
  switch (error.status) {
    case 0:
      return 'Serveur injoignable. Vérifiez votre connexion.';
    case 401:
      return 'Votre session a expiré. Reconnectez-vous.';
    case 403:
      return "Vous n'avez pas les droits pour cette action.";
  }
  const problem = problemOf(error);
  if (problem?.errors && Object.keys(problem.errors).length) {
    return 'Certains champs sont invalides.';
  }
  return problem?.detail ?? `Erreur ${error.status}`;
}

/**
 * Puts server-side field errors (problem.errors) on the matching form controls as { server: message }.
 * Returns true if at least one field error was applied.
 */
export function applyServerErrors(error: unknown, form: FormGroup): boolean {
  const errors = problemOf(error)?.errors;
  if (!errors) {
    return false;
  }
  let applied = false;
  for (const [field, message] of Object.entries(errors)) {
    const control: AbstractControl | null = form.get(field.replace(/\[(\d+)\]/g, '.$1'));
    if (control) {
      control.setErrors({ ...control.errors, server: message });
      control.markAsTouched();
      applied = true;
    }
  }
  return applied;
}
