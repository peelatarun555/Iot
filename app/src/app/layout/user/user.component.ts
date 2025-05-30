import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'dui-user',
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        TranslateModule,
        RouterModule,
    ],
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent {
    constructor(private readonly _authService: AuthService) {}

    logout(): void {
        this._authService.logout();
    }
}
