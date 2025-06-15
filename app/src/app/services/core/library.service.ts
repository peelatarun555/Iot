import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { LibrarySeat } from '../../models/core/librarySeat';
import { SocketService } from '../socket.service';
import { SocketState } from '../../models/SocketState';
import { LibrarySeatDto } from '../../models/core/LibrarySeatDto';
import { SeatState } from '../../models/enums/seatState';

@Injectable({
    providedIn: 'root',
})
export class LibraryService {
    private readonly _librarySeats: WritableSignal<LibrarySeat[]>;
    private readonly FIVE_MIN: number;

    constructor(private readonly _socketService: SocketService) {
        this._librarySeats = signal([]);
        this._seatStats = signal(new Map<string, number>());
        this.FIVE_MIN = 1000 * 60 * 5;

        setInterval(() => this._updateInactiveSeats(), this.FIVE_MIN);
    }

    private _seatStats: WritableSignal<Map<string, number>>;

    public get seatStats(): Signal<Map<string, number>> {
        return this._seatStats.asReadonly();
    }

    public get librarySeats(): Signal<LibrarySeat[]> {
        return this._librarySeats.asReadonly();
    }

    public get socketStatus(): Signal<SocketState> {
        return this._socketService.socketStatus;
    }

    updateSeatStatistics() {
        let groundFreeSeats = 0;
        let groundOccSeats = 0;
        let groundInBetweenSeats = 0;
        let upperFreeSeats = 0;
        let upperOccSeats = 0;
        let upperInBetweenSeats = 0;
        for (const seat of this._librarySeats()) {
            if (seat.libraryId.includes('ground')) {
                if (seat.state === SeatState.FREE) groundFreeSeats += 1;
                if (seat.state === SeatState.OCCUPIED) groundOccSeats += 1;
                if (seat.state === SeatState.IN_BETWEEN)
                    groundInBetweenSeats += 1;
            } else if (seat.libraryId.includes('upper')) {
                if (seat.state === SeatState.FREE) upperFreeSeats += 1;
                if (seat.state === SeatState.OCCUPIED) upperOccSeats += 1;
                if (seat.state === SeatState.IN_BETWEEN)
                    upperInBetweenSeats += 1;
            }
        }

        this._seatStats.set(
            new Map([
                ['ground_free', groundFreeSeats],
                ['ground_occupied', groundOccSeats],
                ['ground_inBetween', groundInBetweenSeats],
                ['upper_free', upperFreeSeats],
                ['upper_occupied', upperOccSeats],
                ['upper_inBetween', upperInBetweenSeats],
            ])
        );
    }

    getColor(libraryId: string): string | undefined {
        const seat = this.librarySeats().find(
            (seat) => seat.libraryId === libraryId
        );
        if (!seat) return undefined;
        return this.convertColor(seat.state);
    }

    convertColor(state: SeatState): string {
        switch (state) {
            case SeatState.FREE:
                return '#65b32a';
            case SeatState.OCCUPIED:
                return '#f64a16';
            case SeatState.IN_BETWEEN:
                return '#f1d004';
            default:
                return '#757575';
        }
    }

    getTooltip(libraryId: string): string {
        const seat = this.librarySeats().find(
            (seat) => seat.libraryId === libraryId
        );
        if (!seat) return libraryId + ' is not yet tracked';
        if (seat && !seat.devEui) return libraryId + ' \nDevEUI: Not found';
        return libraryId + ` \nDevEUI: ${seat.devEui}`;
    }

    init() {
        this._socketService.on('connect', () => {
            this._requestInitialData();
            this._setupDataChangeListener();
        });
    }

    private _requestInitialData() {
        this._socketService.emit('request library data');
        this._socketService.on(
            'initial seat states',
            (payload: LibrarySeatDto[]) => {
                const seats: LibrarySeat[] = payload.map(
                    (item) => new LibrarySeat(item)
                );
                this._librarySeats.set(seats);
                this.updateSeatStatistics();
            }
        );
    }

    private _setupDataChangeListener() {
        this._socketService.on(
            'library seat changed',
            (payload: LibrarySeatDto) => {
                const currentSeats = this._librarySeats();
                const seat = currentSeats.find(
                    (seat) => seat.libraryId === payload['libraryId']
                );

                if (seat) seat.state = payload.seatState;
                else currentSeats.push(new LibrarySeat(payload));

                this._librarySeats.set([...currentSeats]);
                this.updateSeatStatistics();
            }
        );
    }

    private _updateInactiveSeats() {
        const updatedSeats = this._librarySeats().map((seat) => {
            seat.checkInactivity(this.FIVE_MIN);
            return seat;
        });
        this._librarySeats.set(updatedSeats);
    }
}
