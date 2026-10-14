import { HttpErrorResponse } from '@angular/common/http';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { applyServerErrors, errorMessage } from './problem-detail';

const httpError = (status: number, body: unknown = null) => new HttpErrorResponse({ status, error: body });

describe('problem-detail helpers', () => {
  it('uses the server "detail" message for business errors', () => {
    expect(errorMessage(httpError(409, { status: 409, detail: 'SKU already in use: X' }))).toBe('SKU already in use: X');
  });

  it('gives friendly messages for network and security errors', () => {
    expect(errorMessage(httpError(0))).toContain('injoignable');
    expect(errorMessage(httpError(403))).toContain('droits');
    expect(errorMessage(httpError(401))).toContain('session');
  });

  it('puts field errors on the matching controls, including array items', () => {
    const form = new FormGroup({
      name: new FormControl(''),
      images: new FormArray([new FormGroup({ url: new FormControl('x') })]),
    });
    const applied = applyServerErrors(
      httpError(400, { errors: { name: 'must not be blank', 'images[0].url': 'too long', unknown: 'ignored' } }),
      form,
    );
    expect(applied).toBe(true);
    expect(form.get('name')?.getError('server')).toBe('must not be blank');
    expect(form.get('images.0.url')?.getError('server')).toBe('too long');
  });

  it('reports when there are no field errors', () => {
    expect(applyServerErrors(httpError(409, { detail: 'conflict' }), new FormGroup({}))).toBe(false);
  });
});
