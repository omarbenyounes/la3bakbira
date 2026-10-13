import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
  AutoRefreshTokenService,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  includeBearerTokenInterceptor,
  provideKeycloak,
  UserActivityService,
  withAutoRefreshToken,
} from 'keycloak-angular';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideKeycloak({
      config: environment.keycloak,
      initOptions: {
        // Detect an existing session silently; visitors can browse without logging in
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      },
      features: [withAutoRefreshToken({ onInactivityTimeout: 'logout', sessionTimeout: 30 * 60 * 1000 })],
      providers: [AutoRefreshTokenService, UserActivityService],
    }),
    // The access token is attached only to our own API calls, never to third-party URLs
    {
      provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
      useValue: [{ urlPattern: /^\/api\//i }],
    },
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor])),
    provideRouter(routes, withComponentInputBinding()),
  ],
};
