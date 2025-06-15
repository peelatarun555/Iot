"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SeatState;
(function (SeatState) {
    SeatState[SeatState["UNKNOWN"] = 0] = "UNKNOWN";
    SeatState[SeatState["IN_BETWEEN"] = 1] = "IN_BETWEEN";
    SeatState[SeatState["FREE"] = 2] = "FREE";
    SeatState[SeatState["OCCUPIED"] = 3] = "OCCUPIED";
})(SeatState || (SeatState = {}));
exports.default = SeatState;
