import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LanguagesComponent } from 'src/app/layout/languages/languages.component';
import { SchemesComponent } from 'src/app/layout/schemes/schemes.component';

@Component({
    standalone: true,
    imports: [SchemesComponent, LanguagesComponent],
    templateUrl: './general-settings.component.html',
    styleUrl: './general-settings.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralSettingsComponent {}
