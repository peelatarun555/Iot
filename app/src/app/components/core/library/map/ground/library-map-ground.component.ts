import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LibraryMapDirective } from '../library-map.directive';
import { LibraryService } from '../../../../../services/core/library.service';
import { BuildingLevel } from '../../../../../models/enums/buildingLevel';
import { LibraryChartComponent } from '../../chart/library-chart.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../../../services/auth.service';

@Component({
    selector: 'dui-library-map-ground',
    standalone: true,
    templateUrl: './library-map-ground.component.html',
    styleUrls: ['../library-map.directive.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [LibraryChartComponent, TranslateModule, MatTooltipModule],
})
export class LibraryMapGroundComponent extends LibraryMapDirective {
    constructor(
        protected override readonly libraryService: LibraryService,
        protected override readonly authService: AuthService
    ) {
        super(libraryService, authService);

        this.floor = BuildingLevel.GROUND;
        this.svgRatio = 1350.0 / 1075.0;
    }
}
