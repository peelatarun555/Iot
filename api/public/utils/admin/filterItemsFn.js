"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function filterItems(items, filterFn, skip, take) {
    const filteredItems = [];
    let matchCount = 0;
    for (let i = 0; i < items.length; i++) {
        if (filterFn(items[i])) {
            if (matchCount >= skip && filteredItems.length < take)
                filteredItems.push(items[i]);
            matchCount++;
        }
    }
    return {
        filteredItems,
        totalItemsFound: matchCount,
    };
}
exports.default = filterItems;
