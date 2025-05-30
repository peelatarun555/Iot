import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LibraryMapGroundComponent } from '../../../../components/core/library/map/ground/library-map-ground.component';
import { LibraryChartComponent } from '../../../../components/core/library/chart/library-chart.component';
import { MatCard } from '@angular/material/card';

@Component({
    selector: 'dui-library-ground-page',
    standalone: true,
    imports: [LibraryMapGroundComponent, LibraryChartComponent, MatCard],
    templateUrl: './library-ground-page.component.html',
    styleUrls: ['../floors.directive.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryGroundPageComponent {}
