import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppTranslationService } from './core/translation/translation.service';

@Component({
    selector: 'dui-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [RouterModule],
    standalone: true,
})
export class AppComponent implements OnInit {
    constructor(
        private readonly matIconRegistry: MatIconRegistry,
        private domSanitizer: DomSanitizer,
        private readonly _translationService: AppTranslationService
    ) {
        this.matIconRegistry.addSvgIcon(
            'de_flag',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                'assets/img/de.svg'
            )
        );
        this.matIconRegistry.addSvgIcon(
            'en_flag',
            this.domSanitizer.bypassSecurityTrustResourceUrl(
                'assets/img/en.svg'
            )
        );
    }

    ngOnInit(): void {
        this._translationService.setInitialLang();
    }
}
