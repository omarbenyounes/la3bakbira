import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Header } from './header';
import { FakeUser, provideFakeKeycloak } from '../../../testing/keycloak-test-providers';
import { CategoryTreeNode } from '../../core/catalog/catalog.models';

const node = (id: number, name: string, slug: string, children: CategoryTreeNode[] = []): CategoryTreeNode => ({
  id, name, slug, imageUrl: null, displayOrder: 0, active: true, children,
});

describe('Header', () => {
  async function render(user?: FakeUser) {
    TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), ...provideFakeKeycloak(user)],
    });
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    return { fixture, http, element: fixture.nativeElement as HTMLElement };
  }

  it('builds the category menu from the catalog API', async () => {
    const { fixture, http, element } = await render();
    http
      .expectOne((req) => req.url === '/api/catalog/categories/tree' && req.params.get('activeOnly') === 'true')
      .flush([node(1, 'Informatique', 'informatique', [node(2, 'PC Portables', 'pc-portables', [node(3, 'PC Gamer', 'pc-gamer')])])]);
    await fixture.whenStable();
    fixture.detectChanges();

    const top = element.querySelector('.top-item > a') as HTMLAnchorElement;
    expect(top.textContent?.trim()).toBe('Informatique');
    expect(top.getAttribute('href')).toBe('/categorie/informatique');
    expect(element.querySelector('.mega-title')?.textContent?.trim()).toBe('PC Portables');
    expect(element.querySelector('.mega-grid li a')?.getAttribute('href')).toBe('/categorie/pc-gamer');
    http.verify();
  });

  it('shows an error message when the catalog is unreachable', async () => {
    const { fixture, http, element } = await render();
    http.expectOne('/api/catalog/categories/tree?activeOnly=true').flush('down', { status: 503, statusText: 'Unavailable' });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('.menu-status')?.textContent).toContain('indisponibles');
  });

  it('offers login and registration to visitors', async () => {
    const { element } = await render();
    expect(element.textContent).toContain('Se connecter');
    expect(element.textContent).toContain('Créer un compte');
  });

  it('shows the name of a logged-in user', async () => {
    const { element } = await render({ name: 'Store', roles: ['ADMIN'] });
    expect(element.querySelector('.account-btn')?.textContent).toContain('Store');
    expect(element.textContent).not.toContain('Se connecter');
  });
});
