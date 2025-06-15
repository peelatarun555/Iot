import { Place } from '../models/place';
import { Device, DeviceType } from '../models/device';
import { Sensor, SensorType } from '../models/sensor';
import { OptionItem } from '../models/core';

function createOptionItem(text: string, tooltip?: string): OptionItem {
    return <OptionItem>{
        id: -1,
        text,
        tooltip: tooltip ?? text,
    };
}

function transformToOptionItem(
    item: Place | Device | Sensor | DeviceType | SensorType
): OptionItem {
    return <OptionItem>{
        id: item.id,
        text: item.name,
        tooltip: item.name,
    };
}

export { createOptionItem, transformToOptionItem };
