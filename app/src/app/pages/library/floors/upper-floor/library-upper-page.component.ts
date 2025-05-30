import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LibraryMapUpperComponent } from '../../../../components/core/library/map/upper/library-map-upper.component';
import { LibraryChartComponent } from '../../../../components/core/library/chart/library-chart.component';

@Component({
    selector: 'dui-library-upper-page',
    standalone: true,
    imports: [LibraryMapUpperComponent, LibraryChartComponent],
    templateUrl: './library-upper-page.component.html',
    styleUrls: ['../floors.directive.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryUpperPageComponent {}
