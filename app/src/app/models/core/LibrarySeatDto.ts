import { SeatState } from '../enums/seatState';

export interface LibrarySeatDto {
    libraryId: string;
    seatState: SeatState;
    devEui: string;
}
