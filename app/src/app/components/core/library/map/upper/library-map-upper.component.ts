import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LibraryMapDirective } from '../library-map.directive';
import { LibraryChartComponent } from '../../chart/library-chart.component';
import { BuildingLevel } from '../../../../../models/enums/buildingLevel';
import { LibraryService } from '../../../../../services/core/library.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../../../services/auth.service';

@Component({
    selector: 'dui-library-map-upper',
    standalone: true,
    templateUrl: './library-map-upper.component.html',
    styleUrls: ['../library-map.directive.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LibraryChartComponent, MatTooltipModule],
})
export class LibraryMapUpperComponent extends LibraryMapDirective {
    constructor(
        protected override readonly libraryService: LibraryService,
        protected override readonly authService: AuthService
    ) {
        super(libraryService, authService);

        this.floor = BuildingLevel.FIRST_LEVEL;
        this.svgRatio = 1300.0 / 1015.0;
    }
}
