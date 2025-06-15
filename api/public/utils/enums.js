"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeGroupSettings = exports.SensorDataType = exports.DeviceStatus = exports.Permission = exports.Role = exports.Locale = void 0;
const type_graphql_1 = require("type-graphql");
var Locale;
(function (Locale) {
    Locale["de"] = "de";
    Locale["en"] = "en";
})(Locale || (exports.Locale = Locale = {}));
var Role;
(function (Role) {
    Role["admin"] = "admin";
    Role["moderator"] = "moderator";
    Role["default"] = "default";
})(Role || (exports.Role = Role = {}));
(0, type_graphql_1.registerEnumType)(Role, {
    name: "Role",
});
var Permission;
(function (Permission) {
    Permission["read"] = "read";
    Permission["write"] = "write";
    Permission["admin"] = "admin";
})(Permission || (exports.Permission = Permission = {}));
(0, type_graphql_1.registerEnumType)(Permission, {
    name: "Permission",
});
var DeviceStatus;
(function (DeviceStatus) {
    DeviceStatus["development"] = "development";
    DeviceStatus["production"] = "production";
    DeviceStatus["emptyBattery"] = "emptyBattery";
})(DeviceStatus || (exports.DeviceStatus = DeviceStatus = {}));
(0, type_graphql_1.registerEnumType)(DeviceStatus, {
    name: "DeviceStatus",
});
var SensorDataType;
(function (SensorDataType) {
    SensorDataType["number"] = "number";
    SensorDataType["string"] = "string";
})(SensorDataType || (exports.SensorDataType = SensorDataType = {}));
(0, type_graphql_1.registerEnumType)(SensorDataType, {
    name: "SensorDataType",
});
var TimeGroupSettings;
(function (TimeGroupSettings) {
    TimeGroupSettings["year"] = "year";
    TimeGroupSettings["week"] = "week";
    TimeGroupSettings["month"] = "month";
    TimeGroupSettings["day"] = "day";
    TimeGroupSettings["hour"] = "hour";
    TimeGroupSettings["minute"] = "minute";
    TimeGroupSettings["second"] = "second";
})(TimeGroupSettings || (exports.TimeGroupSettings = TimeGroupSettings = {}));
(0, type_graphql_1.registerEnumType)(TimeGroupSettings, {
    name: "TimeGroupSettings",
});
