import IAdminRequest from './IAdminRequest';

interface IDevicesRequest extends IAdminRequest {
    deviceName: string;
    deviceEui: string;
    deviceDescription: string;
    deviceType: string;
    placeName: string;
}

export default IDevicesRequest;
