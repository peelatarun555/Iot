import AdminItemsDto from './AdminItemsDto';
import { Place } from '../place';

interface AdminPlacesDto extends AdminItemsDto {
    places: Place[];
}

export default AdminPlacesDto;
