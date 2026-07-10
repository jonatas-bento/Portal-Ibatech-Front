import {
  ApplicationConfig,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withRouterConfig,
} from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
  withFetch,
} from '@angular/common/http';
import {
  provideAnimationsAsync,
} from '@angular/platform-browser/animations/async';

// CORREÇÃO: Mudado de 'src/app/app.routes' para o caminho relativo direto './app.routes'
import { routes } from './app.routes';
import { jwtInterceptor }   from './core/interceptors/jwt.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { errorInterceptor }   from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),

    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({ onSameUrlNavigation: 'reload' })
    ),

    provideHttpClient(
      withFetch(),
      withInterceptors([
        jwtInterceptor,    // 1º — injeta Bearer token
        loadingInterceptor, // 2º — controla spinner global
        errorInterceptor,   // 3º — trata 401/403/500
      ])
    ),
  ],
};