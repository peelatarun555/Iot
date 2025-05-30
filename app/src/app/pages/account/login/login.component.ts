import {
    ChangeDetectionStrategy,
    Component,
    computed,
    Signal,
} from '@angular/core';
import { LoggingService } from 'src/app/services/logging.service';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'dui-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [
        CommonModule,
        MatButtonModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatProgressSpinnerModule,
        TranslateModule,
        MatIconModule,
    ],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
    public readonly year: number;

    protected isLoading: boolean;
    protected loginInvalid: Signal<boolean>;

    private _authenticationRequested: boolean;

    constructor(
        private readonly _logger: LoggingService,
        private readonly _authService: AuthService
    ) {
        this._logger.log('Logger.log() works from login.component');

        this.year = new Date().getFullYear();

        this.isLoading = false;
        this._authenticationRequested = false;

        this.loginInvalid = computed(() => {
            this.isLoading = this._authService.isLoading();
            if (this.isLoading && !this._authenticationRequested) {
                this._authenticationRequested = true;
                return false;
            } else {
                return !this.isLoading && this._authService.errorMsg() !== null;
            }
        });
    }

    submitForm(form: NgForm) {
        this._authService.logIn(
            form.controls['email'].value,
            form.controls['password'].value
        );
    }
}
