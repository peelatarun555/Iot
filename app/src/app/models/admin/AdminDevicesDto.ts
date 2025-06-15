import AdminItemsDto from './AdminItemsDto';
import { Device } from '../device';

interface AdminDevicesDto extends AdminItemsDto {
    devices: Device[];
}

export default AdminDevicesDto;
