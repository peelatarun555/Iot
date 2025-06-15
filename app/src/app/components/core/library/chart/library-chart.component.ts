import {
    ChangeDetectionStrategy,
    Component,
    computed,
    Input,
    Signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BuildingLevel } from '../../../../models/enums/buildingLevel';
import { LibraryService } from '../../../../services/core/library.service';
import { TranslateModule } from '@ngx-translate/core';
import { SeatState } from '../../../../models/enums/seatState';

@Component({
    selector: 'dui-library-chart[floor]',
    standalone: true,
    imports: [MatCardModule, TranslateModule],
    templateUrl: './library-chart.component.html',
    styleUrls: ['./library-chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryChartComponent {
    @Input() public floor!: BuildingLevel;

    protected seats: Signal<number[]>;

    constructor(private _libraryService: LibraryService) {
        this.seats = computed(() => {
            const seatStats = this._libraryService.seatStats();
            if (seatStats.size === 0) return [1, 0, 0, 0];
            return this._calculateOccupancy(seatStats);
        });
    }

    /**
     * Called upon when Library seatStats() changes using above's computed()
     */
    private _calculateOccupancy(stats: Map<string, number>): number[] {
        const floor = this.floor == BuildingLevel.GROUND ? 'ground' : 'upper';

        const freeSeats = stats.get(`${floor}_free`) ?? 0;
        const inBetweenSeats = stats.get(`${floor}_inBetween`) ?? 0;
        const occSeats = stats.get(`${floor}_occupied`) ?? 0;

        return [
            freeSeats === 0 && inBetweenSeats === 0 && occSeats === 0 ? 1 : 0,
            freeSeats,
            inBetweenSeats,
            occSeats,
        ];
    }

    getColor(seatState: SeatState): string {
        return this._libraryService.convertColor(seatState);
    }

    protected readonly SeatState = SeatState;
}
