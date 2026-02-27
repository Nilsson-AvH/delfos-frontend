import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

// Interceptores
import { devBypassInterceptor } from './interceptors/dev-bypass.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Interceptores
    // provideHttpClient(); // XMLHttpRequest tecnologia antigua
    provideHttpClient(
      withFetch(), // Usa Fetch API (moderna) en lugar de XMLHttpRequest
      // withInterceptors([devBypassInterceptor]) // Agrega el interceptor
    )
  ]
};