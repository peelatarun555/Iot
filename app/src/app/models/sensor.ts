import { SensorDataType } from '../restapi/utils/enums';
import { Device } from './device';
import { Project } from './project';
import { DataPoint } from './datapoint';

export interface SensorType {
    id: number;

    name: string;
    type: SensorDataType;
}

export interface BaseSensor {
    name: string;
    alias?: string;
    libraryId?: string;
    sensorType: string | SensorType;
}

export interface Sensor extends BaseSensor {
    id: number;
    deletedAt?: Date | null;
    data?: DataPoint[];
    device: Device;
    projects: Project[];
}
