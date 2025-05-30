import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'dui-view-layout',
    templateUrl: './view-layout.component.html',
    styleUrl: './view-layout.component.scss',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule],
})
export class ViewLayoutComponent {}
