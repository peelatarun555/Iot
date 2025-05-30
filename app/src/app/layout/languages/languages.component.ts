import {
    ChangeDetectionStrategy,
    Component,
    Signal,
    computed,
    effect,
    input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { isEqual } from 'lodash';
import { Language } from 'src/app/core/translation/language';
import { AppTranslationService } from 'src/app/core/translation/translation.service';

@Component({
    selector: 'dui-languages',
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        TranslateModule,
        MatSelectModule,
        ReactiveFormsModule,
    ],
    templateUrl: './languages.component.html',
    styleUrl: './languages.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguagesComponent {
    // flag to change layout
    compactLayout = input<boolean>(true);

    availableLangs = computed(this._translationService.availableLanguages);

    currentLang: Signal<Language> = computed(
        this._translationService.currentLang,
        { equal: isEqual }
    );

    currentLangForm = new FormControl<string>(this.currentLang().value);

    constructor(private _translationService: AppTranslationService) {
        this.currentLangForm.valueChanges
            .pipe(takeUntilDestroyed())
            .subscribe((lang) => {
                const langObj = this.availableLangs().find(
                    (language) => language.value === lang
                );
                if (lang && langObj) this.switchLanguage(langObj);
            });

        effect(() => {
            if (this.currentLang().value !== this.currentLangForm.value)
                this.currentLangForm.setValue(this.currentLang().value);
        });
    }

    switchLanguage(lang: Language) {
        if (!lang) return;
        this._translationService.currentLang = lang;
    }
}
