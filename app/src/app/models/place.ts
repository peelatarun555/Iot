import { Permission } from '../restapi/utils/enums';
import { Device } from './device';
import { User } from './user';

export interface Place {
    id: number;

    name: string;

    parent?: Place;
    parentId?: number;

    placeAccess: PlaceAccess[];

    devices: Device[];
}

export interface PlaceAccess {
    id: number;
    user: User;
    place: Place;
    permission: Permission;
}
