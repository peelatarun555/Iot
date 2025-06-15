import Place from "@schemas/place.schema";
import Device from "@schemas/device.schema";
import Sensor from "@schemas/sensor.schema";

type FilterFnResult<T> = {
  filteredItems: T[];
  totalItemsFound: number
}

function filterItems<T extends Place | Device | Sensor>(items: T[], filterFn: (item: T) => boolean, skip: number, take: number): FilterFnResult<T> {
  const filteredItems: T[] = [];
  let matchCount = 0;

  for (let i = 0; i < items.length; i++) {
    if (filterFn(items[i])) {
      if (matchCount >= skip && filteredItems.length < take) filteredItems.push(items[i]);
      matchCount++;
    }
  }

  return {
    filteredItems,
    totalItemsFound: matchCount,
  };
}

export default filterItems;