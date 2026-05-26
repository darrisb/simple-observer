import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { LocationStrategy } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { authInterceptor } from './services/authInterceptor';
import { InternalRouterLocationStrategy } from './services/internal-router-location.strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(), // Required for PrimeNG animations
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: LocationStrategy, useClass: InternalRouterLocationStrategy },
    provideHttpClient(
      withInterceptors([authInterceptor]) // Correct way to register functional interceptors
    ),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    })
  ]
};
