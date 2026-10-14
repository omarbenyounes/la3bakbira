import { HttpParams } from '@angular/common/http';

type ParamValue = string | number | boolean | null | undefined | ReadonlyArray<string | number>;

/** Builds HttpParams, skipping empty values and repeating array values (?brandId=1&brandId=2). */
export function toHttpParams(query: object): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(query) as [string, ParamValue][]) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params = params.append(key, String(item));
      }
    } else if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}
