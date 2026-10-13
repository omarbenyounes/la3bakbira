import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';

/**
 * Decision used by {@link adminGuard}: visitors are sent to the Keycloak login page,
 * logged-in users without the ADMIN role get the "access denied" page.
 */
export async function decideAdminAccess(
  targetUrl: string,
  { authenticated, grantedRoles, keycloak }: AuthGuardData,
  router: Router,
): Promise<boolean | UrlTree> {
  if (!authenticated) {
    await keycloak.login({ redirectUri: window.location.origin + targetUrl });
    return false;
  }
  return grantedRoles.realmRoles.includes('ADMIN') ? true : router.parseUrl('/acces-refuse');
}

export const adminGuard = createAuthGuard<CanActivateFn>((_route, state, authData) =>
  decideAdminAccess(state.url, authData, inject(Router)),
);
