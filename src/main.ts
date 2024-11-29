import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { routes } from './app/app-routing.module';
import { authHttpInterceptorFn, provideAuth0 } from '@auth0/auth0-angular';
import { environment as env } from './environments/environment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { environment } from './environments/environment';
import { isDevMode } from '@angular/core';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authHttpInterceptorFn])),
    provideRouter(routes),
    provideAuth0({
        ...env.auth,
        httpInterceptor: {
            ...env.httpInterceptor,
        },
    }),
    {
        provide: HIGHLIGHT_OPTIONS,
        useValue: {
            coreLibraryLoader: () => import('highlight.js/lib/core'),
            languages: {
                json: () => import('highlight.js/lib/languages/json'),
            },
        },
    },
    provideServiceWorker('ngsw-worker.js', {
        enabled: environment.production,
    }),
    provideServiceWorker('ngsw-worker.js', {
        enabled: true, 
        registrationStrategy: 'registerWhenStable:30000'
    })
],
});
