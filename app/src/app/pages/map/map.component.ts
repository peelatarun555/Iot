import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CampusMapComponent } from '../../components/core/campus-map/campus-map.component';

@Component({
    selector: 'dui-map',
    standalone: true,
    imports: [CampusMapComponent],
    templateUrl: './map.component.html',
    styleUrl: './map.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent {}
