import AdminItemsDto from './AdminItemsDto';
import { Sensor } from '../sensor';

interface AdminSensorsDto extends AdminItemsDto {
    sensors: Sensor[];
}

export default AdminSensorsDto;
