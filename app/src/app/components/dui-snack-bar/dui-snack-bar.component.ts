import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import SnackBarData from './utils/SnackBarData';

@Component({
    standalone: true,
    templateUrl: './dui-snack-bar.component.html',
    styleUrls: ['./dui-snack-bar.component.scss'],
    imports: [MatIconModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DuiSnackBarComponent {
    protected messages: string[];

    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: SnackBarData) {
        this.messages = data?.message?.split('\n') ?? [];
    }
}
