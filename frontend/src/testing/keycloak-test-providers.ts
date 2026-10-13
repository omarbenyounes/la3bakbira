import { Provider, signal } from '@angular/core';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';
import { vi } from 'vitest';

export interface FakeUser {
  name: string;
  roles: string[];
}

/** Minimal stand-in for keycloak-js: no network, no redirects. */
export function fakeKeycloak(user?: FakeUser) {
  return {
    authenticated: !!user,
    tokenParsed: user ? { given_name: user.name, preferred_username: user.name } : undefined,
    realmAccess: user ? { roles: user.roles } : undefined,
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    register: vi.fn().mockResolvedValue(undefined),
    accountManagement: vi.fn().mockResolvedValue(undefined),
  };
}

export function provideFakeKeycloak(user?: FakeUser): Provider[] {
  return [
    { provide: Keycloak, useValue: fakeKeycloak(user) as unknown as Keycloak },
    { provide: KEYCLOAK_EVENT_SIGNAL, useValue: signal<KeycloakEvent>({ type: KeycloakEventType.Ready }) },
  ];
}
