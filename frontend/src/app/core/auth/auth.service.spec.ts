import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { FakeUser, provideFakeKeycloak } from '../../../testing/keycloak-test-providers';

describe('AuthService', () => {
  function create(user?: FakeUser): AuthService {
    TestBed.configureTestingModule({ providers: provideFakeKeycloak(user) });
    return TestBed.inject(AuthService);
  }

  it('reports an anonymous visitor', () => {
    const auth = create();
    expect(auth.authenticated()).toBe(false);
    expect(auth.isAdmin()).toBe(false);
    expect(auth.displayName()).toBe('');
  });

  it('reads name and roles of a customer', () => {
    const auth = create({ name: 'Test', roles: ['CUSTOMER'] });
    expect(auth.authenticated()).toBe(true);
    expect(auth.displayName()).toBe('Test');
    expect(auth.isAdmin()).toBe(false);
  });

  it('detects the ADMIN realm role', () => {
    expect(create({ name: 'Store', roles: ['CUSTOMER', 'ADMIN'] }).isAdmin()).toBe(true);
  });
});
