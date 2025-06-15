import {
    provideRouter,
    withHashLocation,
    withViewTransitions,
} from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';

import {
    HttpClient,
    provideHttpClient,
    withInterceptors,
} from '@angular/common/http';
import {
    APP_INITIALIZER,
    ENVIRONMENT_INITIALIZER,
    importProvidersFrom,
    inject,
} from '@angular/core';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../main';
import { SchemeService } from './layout/schemes/schemes.service';
import {
    errorInterceptorFn,
    tokenInterceptorFn,
} from './services/http-interceptor-functions';
import { LibraryService } from './services/core/library.service';

const APP_PROVIDERS = [
    provideRouter(routes, withHashLocation(), withViewTransitions()),
    provideAnimations(),

    provideHttpClient(
        withInterceptors([errorInterceptorFn, tokenInterceptorFn])
    ),

    // Generate Angular Material theme and light/dark mode styles
    {
        provide: ENVIRONMENT_INITIALIZER,
        useValue: () => inject(SchemeService),
        multi: true,
    },

    importProvidersFrom(LoggerModule.forRoot({ level: NgxLoggerLevel.DEBUG })),

    importProvidersFrom(
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient],
            },
        })
    ),

    {
        provide: APP_INITIALIZER,
        useFactory: (libraryService: LibraryService) => () =>
            libraryService.init(),
        deps: [LibraryService],
        multi: true,
    },
];

export default APP_PROVIDERS;
