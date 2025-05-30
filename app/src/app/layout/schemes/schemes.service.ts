import { MediaMatcher } from '@angular/cdk/layout';
import {
    computed,
    effect,
    Injectable,
    Signal,
    signal,
    WritableSignal,
} from '@angular/core';
import { LocalStorageService } from 'src/app/services/core/local-storage.service';

export type Scheme = 'light' | 'dark';

@Injectable({
    providedIn: 'root',
})
export class SchemeService {
    availableSchemes: Signal<Array<Scheme>> = computed(() => ['light', 'dark']);

    constructor(
        private _mediaMatcher: MediaMatcher,
        private _localStorageService: LocalStorageService
    ) {
        this.initialize();

        effect(() => {
            const rootClassList =
                document.getElementsByTagName('html')[0].classList;
            rootClassList.remove('light');
            rootClassList.remove('dark');

            rootClassList.add(this.scheme());
            this._localStorageService.set('scheme', this.scheme() as string);
        });
    }

    private _scheme: WritableSignal<Scheme> = signal('light');

    public get scheme(): Signal<Scheme> {
        return this._scheme.asReadonly();
    }

    public set scheme(scheme: Scheme) {
        this._scheme.set(scheme);
    }

    changeScheme() {
        this.scheme = this.scheme() === 'light' ? 'dark' : 'light';
    }

    initialize() {
        this.matchMediaSchemeChange();

        const storageScheme = JSON.parse(
            this._localStorageService.getValue<string>('scheme')
        );
        if (this.availableSchemes().includes(storageScheme as Scheme)) {
            this.scheme = storageScheme;
        }
    }

    matchMediaSchemeChange() {
        const darkModeOn =
            this._mediaMatcher.matchMedia &&
            this._mediaMatcher.matchMedia('(prefers-color-scheme: dark)')
                .matches;

        // If dark mode is enabled then directly switch to the dark-theme
        if (darkModeOn) {
            this.scheme = 'dark';
        }

        // Watch for changes of the preference
        this._mediaMatcher.matchMedia('(prefers-color-scheme: dark)').onchange =
            (event: MediaQueryListEvent) => {
                const turnOn = event.matches;
                this.scheme = turnOn ? 'dark' : 'light';
            };
    }
}
