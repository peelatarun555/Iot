import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import APP_PROVIDERS from './app/app.providers';

if (environment.PRODUCTION) {
    enableProdMode();
}

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http);
}

bootstrapApplication(AppComponent, {
    providers: APP_PROVIDERS,
}).catch((err) => console.error(err));
