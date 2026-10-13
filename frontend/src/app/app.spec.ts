import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { provideFakeKeycloak } from '../testing/keycloak-test-providers';

describe('App', () => {
  it('renders the shell: header, page outlet and footer', async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), ...provideFakeKeycloak()],
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('app-header .logo')?.textContent).toContain('la3bak');
    expect(element.querySelector('main.page router-outlet')).toBeTruthy();
    expect(element.querySelector('app-footer')).toBeTruthy();
  });
});
