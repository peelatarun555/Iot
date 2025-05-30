import IAdminRequest from './IAdminRequest';

interface ISensorRequest extends IAdminRequest {
    sensorName: string;
    sensorAlias: string;
    sensorType: string;
    libraryId: string;
    deviceName: string;
}

export default ISensorRequest;
