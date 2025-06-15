import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'dui-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
    imports: [RouterModule],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent {}
