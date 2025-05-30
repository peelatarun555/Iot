import {
    ChangeDetectionStrategy,
    Component,
    Signal,
    computed,
    effect,
    input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Scheme, SchemeService } from './schemes.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatLabel } from '@angular/material/form-field';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'dui-schemes',
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        TranslateModule,
        ReactiveFormsModule,
        MatRadioModule,
        MatLabel,
    ],
    templateUrl: './schemes.component.html',
    styleUrl: './schemes.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchemesComponent {
    compactLayout = input<boolean>(true);

    schemes = computed(this._schemeService.availableSchemes);

    // current scheme
    currentScheme: Signal<Scheme> = computed(this._schemeService.scheme);

    // current scheme icon
    schemeIcon = computed(() =>
        this.currentScheme() === 'light' ? 'wb_sunny' : 'brightness_3'
    );

    schemeForm = new FormControl<Scheme>(this.currentScheme());

    constructor(private _schemeService: SchemeService) {
        this.schemeForm.valueChanges
            .pipe(takeUntilDestroyed())
            .subscribe((scheme) => {
                if (scheme === this.currentScheme()) return;
                this.changeScheme();
            });

        effect(() => {
            if (this.schemeForm.value !== this.currentScheme())
                this.schemeForm.setValue(this.currentScheme());
        });
    }

    changeScheme() {
        this._schemeService.changeScheme();
    }
}
