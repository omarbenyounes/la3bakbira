import { computed, inject, Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL } from 'keycloak-angular';

/** Current user state as signals, plus login/logout/register actions (Keycloak hosted pages). */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly keycloak = inject(Keycloak);
  private readonly keycloakEvent = inject(KEYCLOAK_EVENT_SIGNAL);

  // Keycloak's own fields are not signals: reading the event signal makes these re-evaluate on every auth event
  readonly authenticated = computed(() => {
    this.keycloakEvent();
    return this.keycloak.authenticated ?? false;
  });

  readonly displayName = computed(() => {
    this.keycloakEvent();
    const token = this.keycloak.tokenParsed;
    return (token?.['given_name'] as string) ?? (token?.['preferred_username'] as string) ?? '';
  });

  readonly roles = computed(() => {
    this.keycloakEvent();
    return this.keycloak.realmAccess?.roles ?? [];
  });

  readonly isAdmin = computed(() => this.roles().includes('ADMIN'));

  login(returnPath: string = window.location.pathname): Promise<void> {
    return this.keycloak.login({ redirectUri: window.location.origin + returnPath });
  }

  register(): Promise<void> {
    return this.keycloak.register({ redirectUri: window.location.origin });
  }

  logout(): Promise<void> {
    return this.keycloak.logout({ redirectUri: window.location.origin });
  }

  manageAccount(): Promise<void> {
    return this.keycloak.accountManagement();
  }
}
