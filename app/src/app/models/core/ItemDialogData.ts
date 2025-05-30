import ItemTypes from './ItemTypes';

interface ItemDialogData<T> {
    newItem: boolean;
    type: ItemTypes;
    item?: T;
}

export default ItemDialogData;
