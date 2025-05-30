import { LibrarySeatDto } from './LibrarySeatDto';
import { SeatState } from '../enums/seatState';

/**
 * Library Utility Class. Represents a single Seat, i.e. a single activity sensor.
 */
export class LibrarySeat {
    private readonly _libraryId: string;
    private readonly _devEui: string;

    constructor(librarySeat: LibrarySeatDto) {
        this._libraryId = librarySeat.libraryId;
        this._state = librarySeat.seatState;
        this._devEui = librarySeat.devEui;
        this._lastUpdated = Date.now();
    }

    get libraryId() {
        return this._libraryId;
    }

    private _state: SeatState;

    get state(): SeatState {
        return this._state;
    }

    set state(state: SeatState) {
        this._state = state;
        this._lastUpdated = Date.now();
    }

    get devEui(): string {
        return this._devEui;
    }

    private _lastUpdated: number;

    get lastUpdated(): number {
        return this._lastUpdated;
    }

    checkInactivity(timeframe: number) {
        const now = Date.now();
        if (now - this.lastUpdated > timeframe * 2)
            this._state = SeatState.UNKNOWN;
        else if (now - this.lastUpdated > timeframe)
            this._state = SeatState.IN_BETWEEN;
    }
}
