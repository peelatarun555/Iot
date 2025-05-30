import { DeviceStatus } from '../restapi/utils/enums';
import { Place } from './place';
import { Sensor, SensorType } from './sensor';

export interface DeviceType {
    id: number;
    name: string;
}

export interface Device {
    id: number;
    name: string;
    deviceType: DeviceType | string;
    devEui: string;
    description?: string;

    status: DeviceStatus;
    createdAt?: Date;
    deletedAt?: Date | null;

    place: Place;

    sensors: Sensor[];
}

export interface DeviceSensorInput {
    name: string;
    alias?: string;
    sensorType: string | SensorType;
}
