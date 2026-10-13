import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { AuthGuardData } from 'keycloak-angular';
import { decideAdminAccess } from './admin.guard';
import { fakeKeycloak } from '../../../testing/keycloak-test-providers';

describe('decideAdminAccess', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    router = TestBed.inject(Router);
  });

  function authData(roles: string[] | null): AuthGuardData {
    const keycloak = fakeKeycloak(roles ? { name: 'user', roles } : undefined);
    return {
      authenticated: roles !== null,
      grantedRoles: { realmRoles: roles ?? [], resourceRoles: {} },
      keycloak: keycloak as unknown as AuthGuardData['keycloak'],
    };
  }

  it('sends visitors to the Keycloak login page and blocks navigation', async () => {
    const data = authData(null);
    const result = await decideAdminAccess('/admin', data, router);
    expect(result).toBe(false);
    expect(data.keycloak.login).toHaveBeenCalledWith({ redirectUri: window.location.origin + '/admin' });
  });

  it('redirects logged-in customers to the access denied page', async () => {
    const result = await decideAdminAccess('/admin', authData(['CUSTOMER']), router);
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/acces-refuse');
  });

  it('lets administrators in', async () => {
    expect(await decideAdminAccess('/admin', authData(['CUSTOMER', 'ADMIN']), router)).toBe(true);
  });
});
