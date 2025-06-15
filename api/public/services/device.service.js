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
exports.DeviceService = void 0;
const auth_middleware_1 = require("@middlewares/auth.middleware");
const datapoint_schema_1 = require("@schemas/datapoint.schema");
const device_schema_1 = __importStar(require("@schemas/device.schema"));
const place_schema_1 = __importStar(require("@schemas/place.schema"));
const sensor_schema_1 = __importDefault(require("@schemas/sensor.schema"));
const logger_1 = __importDefault(require("@tightec/logger"));
const admin_1 = require("@utils/admin");
const enums_1 = require("@utils/enums");
const graphql_exception_1 = require("@utils/exceptions/graphql.exception");
const http_exception_1 = require("@utils/exceptions/http.exception");
const typeorm_1 = require("typeorm");
const chirpstack_service_1 = __importDefault(require("./chirpstack.service"));
const place_service_1 = __importDefault(require("./place.service"));
const sensor_service_1 = require("./sensor.service");
class DeviceService {
    static async getDeviceTypes() {
        return await device_schema_1.DeviceType.find();
    }
    static async getDevices(options) {
        let devices;
        if (options?.deleted) {
            devices = await device_schema_1.default.find({
                where: { deletedAt: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()) },
                skip: options?.pagination?.skip ?? 0,
                take: options?.pagination?.take ?? 25,
                relations: { deviceType: true },
            });
        }
        else if (options?.userId != null) {
            const placeAccess = await place_schema_1.PlaceAccess.find({
                where: { user: { id: options.userId } },
                relations: { place: { devices: { deviceType: true } } },
                skip: options?.pagination?.skip ?? 0,
                take: options?.pagination?.take ?? 25,
            });
            const devicesPerPlace = placeAccess.map((p) => p.place.devices);
            devices = [];
            for (const row of devicesPerPlace)
                for (const device of row)
                    devices.push(device);
        }
        else {
            if (options?.placeId != null) {
                devices = await device_schema_1.default.find({
                    where: { place: { id: options.placeId }, deletedAt: (0, typeorm_1.IsNull)() },
                    relations: { deviceType: true },
                });
            }
            else {
                devices = await device_schema_1.default.find({
                    where: { deletedAt: (0, typeorm_1.IsNull)() },
                    skip: options?.pagination?.skip ?? 0,
                    take: options?.pagination?.take ?? 25,
                    relations: { deviceType: true },
                });
            }
        }
        devices = devices.map((d) => {
            d.deviceType = d.deviceType.name;
            return d;
        });
        return this.sortDevices(devices);
    }
    static async getAdminDevices(options) {
        const take = options?.pagination?.take ?? 25;
        const index = options?.pagination?.index ?? 0;
        const skip = take * index;
        let dbDevices = await device_schema_1.default.find({
            relations: {
                deviceType: true,
                place: true,
            },
        });
        if (options?.order != null) {
            dbDevices = this._sortAdminDevices(dbDevices, options.order.orderBy, options.order.ascending);
        }
        const filter = options?.filter ?? null;
        const nameFilter = filter?.name != null && filter.name !== "" ? filter.name : null;
        const euiFilter = filter?.eui != null && filter.eui !== "" ? filter.eui : null;
        const descriptionFilter = filter?.description != null && filter.description !== ""
            ? filter.description
            : null;
        const typeFilter = filter?.type != null && filter.type !== "" ? filter.type : null;
        const placeNameFilter = filter?.placeName != null && filter.placeName !== ""
            ? filter.placeName
            : null;
        let adminDevices;
        if (nameFilter != null ||
            euiFilter != null ||
            descriptionFilter != null ||
            typeFilter != null ||
            placeNameFilter != null) {
            const filteredPlaces = (0, admin_1.filterItems)(dbDevices, this._filterFunction(nameFilter, euiFilter, descriptionFilter, typeFilter, placeNameFilter), skip, take);
            adminDevices = {
                devices: filteredPlaces.filteredItems,
                total: filteredPlaces.totalItemsFound,
            };
        }
        else if (skip <= dbDevices.length) {
            adminDevices = {
                devices: dbDevices.slice(skip, skip + take),
                total: dbDevices.length,
            };
        }
        else {
            adminDevices = {
                devices: [],
                total: 0,
            };
        }
        adminDevices.index = index;
        adminDevices.take = take;
        adminDevices.devices = adminDevices.devices.map((d) => {
            d.deviceType = d.deviceType.name;
            return d;
        });
        return adminDevices;
    }
    static async searchDevices(options) {
        let devices;
        if (options?.userId != null) {
            const placeAccess = await place_schema_1.PlaceAccess.find({
                where: { user: { id: options.userId } },
                relations: { place: { devices: { deviceType: true } } },
            });
            const devicesPerPlace = placeAccess.map((p) => p.place.devices);
            devices = devicesPerPlace
                .map((devices) => devices.filter((x) => x.name
                .toLocaleLowerCase()
                .includes(options.searchString.toLocaleLowerCase())))
                .reduce((a, b) => a.concat(b));
        }
        else {
            const dbDeviceList = await device_schema_1.default.find();
            devices = dbDeviceList
                .filter((x) => x.name
                .toLocaleLowerCase()
                .includes(options.searchString.toLocaleLowerCase()))
                .sort((a, b) => (a > b ? -1 : 1));
        }
        return this.sortDevices(devices);
    }
    static async getDeviceByDevEui(devEui) {
        const device = await device_schema_1.default.findOne({
            where: {
                devEui: devEui,
                deletedAt: (0, typeorm_1.IsNull)(),
            },
            relations: { deviceType: true },
        });
        if (!device) {
            throw new graphql_exception_1.NotFoundGraphException("Device with devEui '" + devEui + "' not found");
        }
        device.deviceType = device.deviceType.name;
        return device;
    }
    static async getDevice(deviceId, isDeleted = false) {
        const device = await device_schema_1.default.findOne({
            where: {
                id: deviceId,
                deletedAt: isDeleted ? (0, typeorm_1.Not)(typeorm_1.IsNull) : (0, typeorm_1.IsNull)(),
            },
            relations: { deviceType: true },
        });
        if (!device) {
            throw new graphql_exception_1.NotFoundGraphException("Device with id '" + deviceId + "' not found");
        }
        device.deviceType = device.deviceType.name;
        return device;
    }
    static async createDeviceChirpStack(device) {
        const chirpService = chirpstack_service_1.default.instance;
        try {
            const chirpDevice = await chirpService.getDevice(device.devEui);
            if (chirpDevice != null)
                return;
        }
        catch {
            return;
        }
        await chirpService.createDevice(device);
    }
    static async createDevice(name, devEui, deviceType, status, placeId, options) {
        const place = await place_schema_1.default.findOne({
            where: { id: placeId },
            select: { id: true },
        });
        if (!place) {
            throw new graphql_exception_1.NotFoundGraphException("Place does not exist!");
        }
        const deviceDb = await device_schema_1.default.findOne({
            where: { devEui: devEui.toUpperCase() },
            select: { id: true, deletedAt: true },
        });
        if (deviceDb) {
            if (deviceDb.deletedAt != null) {
                throw new http_exception_1.BadRequestException("Device with devEui " + devEui + " already exists in soft delete");
            }
            else {
                throw new http_exception_1.BadRequestException("Device with devEui " + devEui + " already exists");
            }
        }
        const device = new device_schema_1.default();
        device.createdAt = options?.createdAt ?? new Date();
        device.description = options?.description;
        device.status = status;
        device.devEui = devEui.toUpperCase();
        device.name = name;
        device.place = place;
        device.deviceType = await this.getDeviceType(deviceType);
        device.sensors = [];
        for (const s of options?.sensors ?? []) {
            const sensor = new sensor_schema_1.default();
            sensor.name = s.name;
            sensor.alias = s.alias;
            sensor.device = device;
            sensor.sensorType = await sensor_service_1.SensorService.getSensorType(s.sensorType);
            device.sensors.push(sensor);
        }
        await device.save();
        device.deviceType = device.deviceType.name;
        return device;
    }
    static async getDeviceType(deviceType) {
        let deviceTypeDb = await device_schema_1.DeviceType.findOneBy({ name: deviceType });
        if (!deviceTypeDb) {
            deviceTypeDb = new device_schema_1.DeviceType();
            deviceTypeDb.name = deviceType;
        }
        return deviceTypeDb;
    }
    static async updateDevice(deviceId, userId, options) {
        const device = await device_schema_1.default.findOne({
            where: { id: deviceId, deletedAt: (0, typeorm_1.IsNull)() },
            relations: { deviceType: true },
        });
        if (!device) {
            throw new graphql_exception_1.NotFoundGraphException("Device with id " + deviceId + " does not exists");
        }
        if (!options) {
            return device;
        }
        if (options.createdAt != null)
            device.createdAt = options.createdAt;
        if (options.description != null)
            device.description = options.description;
        if (options.status != null)
            device.status = options.status;
        if (options.devEui != null) {
            const deviceDb = await device_schema_1.default.findOne({
                where: { id: (0, typeorm_1.Not)(deviceId), devEui: options.devEui.toUpperCase() },
                select: { id: true, deletedAt: true },
            });
            if (deviceDb) {
                if (deviceDb.deletedAt != null) {
                    throw new http_exception_1.BadRequestException("Device with devEui " +
                        options.devEui +
                        " already exists in soft delete");
                }
                else {
                    throw new http_exception_1.BadRequestException("Device with devEui " + options.devEui + " already exists");
                }
            }
            device.devEui = options.devEui.toUpperCase();
        }
        if (options.name != null)
            device.name = options.name;
        if (options.placeId != null) {
            if (userId) {
                await place_service_1.default.checkUserPermission(options.placeId, userId, enums_1.Permission.write);
            }
            const place = await place_schema_1.default.findOne({
                where: { id: options.placeId },
            });
            if (!place) {
                throw new graphql_exception_1.NotFoundGraphException("Place does not exist!");
            }
            device.place = place;
        }
        if (options.deviceType)
            device.deviceType = await this.getDeviceType(options.deviceType);
        await device.save();
        device.deviceType = device.deviceType.name;
        return device;
    }
    static async deleteDevice(deviceId) {
        const result = await device_schema_1.default.delete({ id: deviceId });
        return result.affected != null && result.affected > 0;
    }
    static async permanentlyDeleteDevices() {
        const fourWeeksAgo = new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000);
        const result = await device_schema_1.default.delete({ deletedAt: (0, typeorm_1.LessThan)(fourWeeksAgo) });
        if (result.affected != null && result.affected > 0)
            logger_1.default.info("Deleted devices permanently: " + result.affected);
    }
    static async undoSoftDeleteDevice(deviceId) {
        const device = await device_schema_1.default.findOne({
            where: { id: deviceId, deletedAt: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()) },
            relations: { sensors: true, place: true },
        });
        if (!device) {
            throw new graphql_exception_1.NotFoundGraphException("Device is not available for undo soft delete");
        }
        for (let i = 0; i < device.sensors.length; i++) {
            device.sensors[i].deletedAt = null;
        }
        const oldPlaceId = device.description != null
            ? Number(device.description.split("placeId:")[1])
            : null;
        if (oldPlaceId == null) {
            throw new Error("No old place id provided.");
        }
        const oldPlace = await place_schema_1.default.findOneBy({ id: oldPlaceId });
        if (oldPlace) {
            device.place = oldPlace;
        }
        device.deletedAt = null;
        await device.save();
        return device;
    }
    static async softDeleteDevice(deviceId) {
        const device = await device_schema_1.default.findOne({
            where: { id: deviceId, deletedAt: (0, typeorm_1.IsNull)() },
            relations: { sensors: true, place: true },
        });
        if (!device) {
            throw new graphql_exception_1.NotFoundGraphException("Device not found");
        }
        let place = await place_schema_1.default.findOneBy({ name: "Limbo" });
        if (!place) {
            place = await place_service_1.default.createPlace("Limbo");
        }
        const currentDate = new Date();
        device.description = device.description + " - placeId:" + device.place.id;
        device.place = place;
        device.deletedAt = currentDate;
        device.sensors = device.sensors.map((s) => {
            s.deletedAt = currentDate;
            return s;
        });
        await device.save();
        return true;
    }
    static async hardDeleteDevice(deviceId) {
        const device = await device_schema_1.default.findOne({
            where: { id: deviceId, deletedAt: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()) },
            relations: { sensors: true, place: true },
        });
        if (!device) {
            throw new graphql_exception_1.NotFoundGraphException("Device not found or not deleted");
        }
        let count = 0;
        for (const sensor of device.sensors) {
            count += await datapoint_schema_1.Datapoint.count({ where: { sensorId: sensor.id } });
        }
        if (count > 0) {
            throw new graphql_exception_1.BadRequestGraphException("Can not delete device, when " + count + " datapoints for sensors exist");
        }
        await device_schema_1.default.delete({ id: deviceId });
        return true;
    }
    static async getPlaceFromDevice(deviceId) {
        const place = await place_schema_1.default.findOne({ where: { devices: { id: deviceId } } });
        if (!place)
            throw new graphql_exception_1.NotFoundGraphException("Device has no place");
        return place;
    }
    static async checkUserPermission(deviceId, userId, minPermission) {
        const placeAccess = await place_schema_1.PlaceAccess.findOne({
            where: {
                user: { id: userId },
                place: { devices: { id: deviceId, deletedAt: (0, typeorm_1.IsNull)() } },
            },
        });
        if (!placeAccess) {
            throw new graphql_exception_1.ForbiddenGraphException("Access to device forbidden");
        }
        if (!(0, auth_middleware_1.hasPermissionAccess)(placeAccess.permission, minPermission)) {
            throw new graphql_exception_1.ForbiddenGraphException("Access to device forbidden");
        }
    }
    static sortDevices(devices) {
        return devices.sort((a, b) => a.name.localeCompare(b.name));
    }
    static _sortAdminDevices(devices, orderBy, ascending) {
        return devices.sort((a, b) => {
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
                case "eui":
                    propA = a.devEui ?? "";
                    propB = b.devEui ?? "";
                    break;
                case "description":
                    propA = a.description ?? "";
                    propB = b.description ?? "";
                    break;
                case "type":
                    propA =
                        (typeof a.deviceType === "string"
                            ? a.deviceType
                            : a.deviceType.name) ?? "";
                    propB =
                        (typeof b.deviceType === "string"
                            ? b.deviceType
                            : b.deviceType.name) ?? "";
                    break;
                case "place":
                    propA = a.place.name ?? "";
                    propB = b.place.name ?? "";
                    break;
            }
            if (ascending)
                return propA < propB ? -1 : 1;
            return propA > propB ? -1 : 1;
        });
    }
    static _filterFunction(name, eui, description, type, placeName) {
        const filterFns = [];
        if (name != null)
            filterFns.push((device) => device.name.toLocaleLowerCase().includes(name.toLocaleLowerCase()));
        if (eui != null)
            filterFns.push((device) => device.devEui.toLocaleLowerCase().includes(eui.toLocaleLowerCase()));
        if (description != null)
            filterFns.push((device) => (device.description ?? "")
                .toLocaleLowerCase()
                .includes(description.toLocaleLowerCase()));
        if (type != null)
            filterFns.push((device) => {
                if (typeof device.deviceType === "string")
                    return device.deviceType
                        .toLocaleLowerCase()
                        .includes(type.toLocaleLowerCase());
                return device.deviceType.name
                    .toLocaleLowerCase()
                    .includes(type.toLocaleLowerCase());
            });
        if (placeName != null)
            filterFns.push((device) => device.place.name
                .toLocaleLowerCase()
                .includes(placeName.toLocaleLowerCase()));
        return (device) => {
            for (const filterFn of filterFns) {
                if (!filterFn(device))
                    return false;
            }
            return true;
        };
    }
}
exports.DeviceService = DeviceService;
