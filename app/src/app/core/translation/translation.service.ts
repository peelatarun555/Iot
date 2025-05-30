// translation.service.ts
import {
    Injectable,
    Signal,
    WritableSignal,
    effect,
    signal,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Language } from './language';
import { languages } from './languages.data';
import { LocalStorageService } from 'src/app/services/core/local-storage.service';

@Injectable({
    providedIn: 'root',
})
export class AppTranslationService {
    defaultLang = 'en';
    availableLanguages: Signal<Array<Language>> = signal(languages);
    private _currentLang: WritableSignal<Language> = signal(languages[0]);

    constructor(
        private _translateService: TranslateService,
        private _localStorageService: LocalStorageService
    ) {
        // Set the default language
        this._translateService.setDefaultLang(this.defaultLang);

        // Set available languages
        const langValues = this.availableLanguages().map((lang) => lang.value);
        this._translateService.addLangs(langValues);

        // Set initial language
        this.setInitialLang();

        // syncing lang changes to local storage and translate service
        effect(() => {
            const currentLang = this.currentLang().value;
            this._localStorageService.set('lang', currentLang);
            this._translateService.use(currentLang);
        });
    }

    setInitialLang() {
        // Use value from local storage, if available
        const storageLang = this._localStorageService.get<string>('lang');
        if (storageLang) {
            this.currentLang =
                this.availableLanguages().find(
                    (lang) => lang.value === storageLang
                ) || languages[0];
            return;
        }

        // Use the browser's preferred language, if available
        let browserLang = this._translateService.getBrowserLang();
        const regex: RegExp = new RegExp(
            this.availableLanguages()
                .map((lang) => lang.value)
                .join('|')
        );
        browserLang =
            browserLang && browserLang.match(regex)
                ? browserLang
                : this.defaultLang;

        // set initial current languages
        this.currentLang =
            this.availableLanguages().find(
                (lang) => lang.value === browserLang
            ) || languages[0];
    }

    public get currentLang(): Signal<Language> {
        return this._currentLang.asReadonly();
    }
    public set currentLang(value: Language) {
        this._currentLang.update(() => value);
    }
}
