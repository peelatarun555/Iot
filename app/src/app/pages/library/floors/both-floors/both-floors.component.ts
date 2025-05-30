import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { LibraryMapGroundComponent } from '../../../../components/core/library/map/ground/library-map-ground.component';
import { LibraryMapUpperComponent } from '../../../../components/core/library/map/upper/library-map-upper.component';

@Component({
    selector: 'dui-library',
    standalone: true,
    imports: [
        MatDividerModule,
        LibraryMapGroundComponent,
        LibraryMapUpperComponent,
    ],
    templateUrl: './both-floors.component.html',
    styleUrls: ['../floors.directive.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BothFloorsComponent {}
