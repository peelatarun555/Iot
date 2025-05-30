import IAdminRequest from './IAdminRequest';

interface IPlacesRequest extends IAdminRequest {
    placeName: string;
    parentPlaceName: string;
}

export default IPlacesRequest;
