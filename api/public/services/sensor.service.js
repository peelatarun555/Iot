"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorService = void 0;
const datapoint_schema_1 = require("@schemas/datapoint.schema");
const device_schema_1 = __importDefault(require("@schemas/device.schema"));
const sensor_schema_1 = __importStar(require("@schemas/sensor.schema"));
const admin_1 = require("@utils/admin");
const enums_1 = require("@utils/enums");
const graphql_exception_1 = require("@utils/exceptions/graphql.exception");
const typeorm_1 = require("typeorm");
const device_service_1 = require("./device.service");
class SensorService {
    static async getSensorTypes() {
        return await sensor_schema_1.SensorType.find();
    }
    static async getSensors(options) {
        let sensors;
        if (options?.userId != null) {
            sensors = await sensor_schema_1.default.find({
                where: [
                    {
                        device: {
                            place: {
                                id: options.placeId,
                                placeAccess: { user: { id: options.userId } },
                            },
                        },
                        deletedAt: (0, typeorm_1.IsNull)(),
                    },
                    {
                        projects: { projectAccess: { user: { id: options.userId } } },
                        deletedAt: (0, typeorm_1.IsNull)(),
                    },
                ],
                relations: { sensorType: true },
                select: {
                    id: true,
                    name: true,
                    alias: true,
                    sensorType: { name: true },
                },
            });
            return sensors.map((s) => {
                s.sensorType = s.sensorType.name;
                return s;
            });
        }
        else {
            if (options?.deviceId != null) {
                sensors = await sensor_schema_1.default.find({
                    relations: { sensorType: true },
                    where: { device: { id: options.deviceId }, deletedAt: (0, typeorm_1.IsNull)() },
                    select: {
                        id: true,
                        name: true,
                        alias: true,
                        sensorType: { name: true },
                    },
                });
            }
            else {
                sensors = await sensor_schema_1.default.find({
                    where: { deletedAt: (0, typeorm_1.IsNull)() },
                    relations: { sensorType: true },
                    skip: options?.pagination?.skip ?? 0,
                    take: options?.pagination?.take ?? 25,
                    select: {
                        id: true,
                        name: true,
                        alias: true,
                        sensorType: { name: true },
                    },
                });
            }
            return sensors.map((s) => {
                s.sensorType = s.sensorType.name;
                return s;
            });
        }
    }
    static async getAdminSensors(options) {
        const take = options?.pagination?.take ?? 25;
        const index = options?.pagination?.index ?? 0;
        const skip = take * index;
        let dbSensors = await sensor_schema_1.default.find({
            relations: {
                sensorType: true,
                device: true,
            },
        });
        if (options?.order != null) {
            dbSensors = this._sortAdminSensors(dbSensors, options.order.orderBy, options.order.ascending);
        }
        const filter = options?.filter ?? null;
        const nameFilter = filter?.name != null && filter.name !== "" ? filter.name : null;
        const aliasFilter = filter?.alias != null && filter.alias !== "" ? filter.alias : null;
        const typeFilter = filter?.type != null && filter.type !== "" ? filter.type : null;
        const libraryIdFilter = filter?.libraryId != null && filter.libraryId !== ""
            ? filter.libraryId
            : null;
        const deviceNameFilter = filter?.deviceName != null && filter.deviceName !== ""
            ? filter.deviceName
            : null;
        let adminSensors;
        if (nameFilter != null ||
            aliasFilter != null ||
            typeFilter != null ||
            libraryIdFilter != null ||
            deviceNameFilter != null) {
            const filteredPlaces = (0, admin_1.filterItems)(dbSensors, this._filterFunction(nameFilter, aliasFilter, typeFilter, libraryIdFilter, deviceNameFilter), skip, take);
            adminSensors = {
                sensors: filteredPlaces.filteredItems,
                total: filteredPlaces.totalItemsFound,
            };
        }
        else if (skip <= dbSensors.length) {
            adminSensors = {
                sensors: dbSensors.slice(skip, skip + take),
                total: dbSensors.length,
            };
        }
        else {
            adminSensors = {
                sensors: [],
                total: 0,
            };
        }
        adminSensors.index = index;
        adminSensors.take = take;
        adminSensors.sensors = adminSensors.sensors.map((d) => {
            d.sensorType = d.sensorType.name;
            return d;
        });
        return adminSensors;
    }
    static async searchSensors(searchString) {
        const dbSensorList = await sensor_schema_1.default.find();
        return dbSensorList
            .filter((x) => x.name.toLocaleLowerCase().includes(searchString.toLocaleLowerCase()))
            .sort((a, b) => (a > b ? -1 : 1));
    }
    static async getSensor(sensorId) {
        const sensor = await sensor_schema_1.default.findOne({
            where: {
                id: sensorId,
                deletedAt: (0, typeorm_1.IsNull)(),
            },
            relations: { sensorType: true, device: true },
        });
        if (!sensor) {
            throw new graphql_exception_1.NotFoundGraphException("Sensor with id '" + sensorId + "' not found");
        }
        sensor.sensorType = sensor.sensorType.name;
        return sensor;
    }
    static async checkUserPermission(sensorId, userId, minPermission) {
        let permissionList = [];
        switch (minPermission) {
            case enums_1.Permission.admin:
                permissionList = [enums_1.Permission.admin];
                break;
            case enums_1.Permission.write:
                permissionList = [enums_1.Permission.admin, enums_1.Permission.write];
                break;
            case enums_1.Permission.read:
                permissionList = [enums_1.Permission.admin, enums_1.Permission.write, enums_1.Permission.read];
                break;
        }
        const sensor = await sensor_schema_1.default.findOne({
            where: permissionList.map((permission) => {
                return {
                    id: sensorId,
                    deletedAt: (0, typeorm_1.IsNull)(),
                    device: {
                        deletedAt: (0, typeorm_1.IsNull)(),
                        place: {
                            placeAccess: {
                                user: { id: userId },
                                permission: permission,
                            },
                        },
                    },
                };
            }).concat(permissionList.map((permission) => {
                return {
                    id: sensorId,
                    deletedAt: (0, typeorm_1.IsNull)(),
                    projects: {
                        projectAccess: { user: { id: userId }, permission: permission },
                    },
                };
            })),
        });
        if (!sensor) {
            throw new graphql_exception_1.ForbiddenGraphException("Access to sensor forbidden");
        }
    }
    static async getSensorType(sensorType, sensorDataType) {
        let sensorTypeDb = await sensor_schema_1.SensorType.findOneBy({ name: sensorType });
        if (!sensorTypeDb) {
            sensorTypeDb = new sensor_schema_1.SensorType();
            sensorTypeDb.name = sensorType;
            sensorTypeDb.type = sensorDataType ?? enums_1.SensorDataType.number;
            await sensorTypeDb.save();
        }
        return sensorTypeDb;
    }
    static async createSensor(name, sensorType, deviceId, options) {
        const device = await device_service_1.DeviceService.getDevice(deviceId);
        const sensor = new sensor_schema_1.default();
        sensor.name = name;
        sensor.alias = options?.alias;
        sensor.libraryId = options?.libraryId;
        sensor.device = device;
        sensor.sensorType = await this.getSensorType(sensorType, options?.sensorDataType);
        await sensor.save();
        sensor.sensorType = sensor.sensorType.name;
        return sensor;
    }
    static async updateSensor(sensorId, options) {
        const sensor = await sensor_schema_1.default.findOne({
            where: {
                id: sensorId,
                deletedAt: (0, typeorm_1.IsNull)(),
            },
            relations: { sensorType: true },
        });
        if (!sensor) {
            throw new graphql_exception_1.NotFoundGraphException("Sensor with id '" + sensorId + "' not found");
        }
        if (!options)
            return sensor;
        if (options.name)
            sensor.name = options.name;
        if (options.sensorType)
            sensor.sensorType = await this.getSensorType(options.sensorType);
        if (options.deviceId)
            sensor.device = await device_service_1.DeviceService.getDevice(options.deviceId);
        sensor.alias = options.alias;
        sensor.libraryId = options.libraryId === "" ? undefined : options.libraryId;
        await sensor.save();
        sensor.sensorType = sensor.sensorType.name;
        return sensor;
    }
    static async deleteSensor(sensorId) {
        const count = await datapoint_schema_1.Datapoint.count({ where: { sensorId: sensorId } });
        if (count > 0) {
            throw new graphql_exception_1.BadRequestGraphException("Can not delete sensor, when datapoints exist: " + count);
        }
        const result = await sensor_schema_1.default.delete({ id: sensorId });
        return result.affected != null && result.affected > 0;
    }
    static async getDeviceFromSensor(sensorId, withPlace = false) {
        const device = await device_schema_1.default.findOne({
            where: { sensors: { id: sensorId } },
            relations: { place: withPlace },
        });
        if (!device)
            throw new graphql_exception_1.NotFoundGraphException("Sensor has no device");
        return device;
    }
    static _sortAdminSensors(sensors, orderBy, ascending) {
        return sensors.sort((a, b) => {
            let propA = 0;
            let propB = 0;
            switch (orderBy) {
                case "id":
                    propA = a.id;
                    propB = b.id;
                    break;
                case "name":
                    propA = a.name;
                    propB = b.name;
                    break;
                case "alias":
                    propA = a.alias ?? "";
                    propB = b.alias ?? "";
                    break;
                case "type":
                    propA =
                        (typeof a.sensorType === "string"
                            ? a.sensorType
                            : a.sensorType.name) ?? "";
                    propB =
                        (typeof b.sensorType === "string"
                            ? b.sensorType
                            : b.sensorType.name) ?? "";
                    break;
                case "libraryId":
                    propA = a.libraryId ?? "";
                    propB = b.libraryId ?? "";
                    break;
                case "device":
                    propA = a.device.name ?? "";
                    propB = b.device.name ?? "";
                    break;
            }
            if (ascending)
                return propA < propB ? -1 : 1;
            return propA > propB ? -1 : 1;
        });
    }
    static _filterFunction(name, alias, type, libraryId, deviceName) {
        const filterFns = [];
        if (name != null)
            filterFns.push((sensor) => sensor.name.toLocaleLowerCase().includes(name.toLocaleLowerCase()));
        if (alias != null)
            filterFns.push((sensor) => (sensor.alias ?? "")
                .toLocaleLowerCase()
                .includes(alias.toLocaleLowerCase()));
        if (type != null)
            filterFns.push((sensor) => {
                if (typeof sensor.sensorType === "string")
                    return sensor.sensorType
                        .toLocaleLowerCase()
                        .includes(type.toLocaleLowerCase());
                return sensor.sensorType.name
                    .toLocaleLowerCase()
                    .includes(type.toLocaleLowerCase());
            });
        if (libraryId != null)
            filterFns.push((sensor) => (sensor.libraryId ?? "")
                .toLocaleLowerCase()
                .includes(libraryId.toLocaleLowerCase()));
        if (deviceName != null)
            filterFns.push((sensor) => sensor.device.name
                .toLocaleLowerCase()
                .includes(deviceName.toLocaleLowerCase()));
        return (sensor) => {
            for (const filterFn of filterFns) {
                if (!filterFn(sensor))
                    return false;
            }
            return true;
        };
    }
}
exports.SensorService = SensorService;
