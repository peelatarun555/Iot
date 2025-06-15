import { SensorType } from '../restapi/utils/enums';

export interface sensorData {
    value: number;
    deviceId: number;
    sensorType: string | SensorType;
    displayUnit: string;
}
