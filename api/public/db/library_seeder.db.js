"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const place_schema_1 = __importDefault(require("@schemas/place.schema"));
const logger_1 = __importDefault(require("@tightec/logger"));
const device_service_1 = require("@services/device.service");
const enums_1 = require("@utils/enums");
const env_1 = require("@utils/env");
const sensor_service_1 = require("@services/sensor.service");
const device_schema_1 = __importDefault(require("@schemas/device.schema"));
const sensor_schema_1 = __importDefault(require("@schemas/sensor.schema"));
const datapoint_service_1 = require("@services/datapoint.service");
const typeorm_1 = require("typeorm");
class LibrarySeeder {
    static async seed() {
        logger_1.default.verbose("LibrarySeeder: Seeding library places");
        const libraryResult = await place_schema_1.default.upsert({ name: "Library", openAccess: true }, {
            skipUpdateIfNoValuesChanged: true,
            conflictPaths: ["name"],
        });
        const libraryPlace = await place_schema_1.default.findOneOrFail({
            where: { name: "Library" },
        });
        if (libraryResult.identifiers.length > 0) {
            logger_1.default.verbose("LibrarySeeder: Created Library Place");
        }
        if (env_1.env.NODE_ENV === "development" || env_1.env.NODE_ENV === "test") {
            const devices = [];
            if (libraryPlace) {
                try {
                    const numberOfDevices = 10;
                    for (let i = 1; i <= numberOfDevices; i++) {
                        devices.push(await this.createLibraryDevice(libraryPlace.id, i));
                    }
                }
                catch (error) {
                    logger_1.default.error("Library Seeder: Device already exists: " + error.message);
                    const foundDevices = await device_schema_1.default.find({
                        where: { name: (0, typeorm_1.Like)("Library-Testdevice-%") },
                    });
                    devices.push(...foundDevices);
                }
            }
            const sensors = [];
            let tableId = 6;
            try {
                for (const device of devices) {
                    const floor = device.id % 2 == 0 ? "ground" : "upper";
                    if (device.id % 3 == 0) {
                        sensors.push(await this.createLibrarySensor(device.id, floor, tableId));
                    }
                    if (device.id % 3 == 1) {
                        sensors.push(await this.createLibrarySensor(device.id, floor, tableId, 1));
                        sensors.push(await this.createLibrarySensor(device.id, floor, tableId, 2));
                    }
                    if (device.id % 3 == 2) {
                        sensors.push(await this.createLibrarySensor(device.id, floor, tableId, 1));
                        sensors.push(await this.createLibrarySensor(device.id, floor, tableId, 2));
                        sensors.push(await this.createLibrarySensor(device.id, floor, tableId, 3));
                        sensors.push(await this.createLibrarySensor(device.id, floor, tableId, 4));
                    }
                    tableId++;
                }
            }
            catch (error) {
                logger_1.default.error("Library Seeder: Sensor already exists (likely caused by unique libraryId): " +
                    error.message);
                const foundSensors = await sensor_schema_1.default.find({
                    where: { name: (0, typeorm_1.Like)("library-test-activity%") },
                });
                sensors.push(...foundSensors);
                for (const sensor of sensors) {
                    await datapoint_service_1.DatapointService.deleteDatapointsSensor(sensor.id);
                }
            }
            const numberOfDatapoints = 60;
            const timeSpanForTestDataInMinutes = 60;
            for (const sensor of sensors) {
                if (sensor.id % 2 == 0)
                    await this.createFixedDataForLibrarySensor(sensor.id, timeSpanForTestDataInMinutes);
                if (sensor.id % 2 == 1)
                    await this.createRandomDataForLibrarySensor(sensor.id, numberOfDatapoints, timeSpanForTestDataInMinutes);
            }
        }
    }
    static randomBeta(alpha, beta) {
        const u = Math.random();
        const v = Math.random();
        return (Math.pow(u, 1 / alpha) / (Math.pow(u, 1 / alpha) + Math.pow(v, 1 / beta)));
    }
    static async createFixedDataForLibrarySensor(sensorId, timespan) {
        const now = new Date();
        let value = sensorId % 4 == 0 ? 0 : 100;
        for (let i = 0; i < timespan; i++) {
            const timestamp = new Date(now.getTime() + i * 60 * 1000);
            await datapoint_service_1.DatapointService.createDatapoint(timestamp, sensorId, value);
            if ((i + 1) % 10 === 0) {
                value = value === 0 ? 100 : 0;
            }
        }
    }
    static async createRandomDataForLibrarySensor(sensorId, numberDp, timespan) {
        const now = new Date();
        const inOneHour = new Date(now.getTime() + timespan * 60 * 1000);
        for (let i = 0; i < numberDp; i++) {
            const randomTimestamp = new Date(inOneHour.getTime() +
                Math.random() * (now.getTime() - inOneHour.getTime()));
            const weightedValue = this.randomBeta(0.5, 0.5) * 100;
            await datapoint_service_1.DatapointService.createDatapoint(randomTimestamp, sensorId, weightedValue);
        }
    }
    static async createLibrarySensor(deviceId, floor, id, subId = null) {
        const libraryId = subId
            ? `${floor}_seat_${id}_${subId}`
            : `${floor}_seat_${id}`;
        return await sensor_service_1.SensorService.createSensor("library-test-activity", "activity", deviceId, {
            libraryId: libraryId,
        });
    }
    static async createLibraryDevice(libraryPlaceId, id) {
        return await device_service_1.DeviceService.createDevice(`Library-Testdevice-${id}`, `testdevice-${id}`, "activity", enums_1.DeviceStatus.development, libraryPlaceId);
    }
}
exports.default = LibrarySeeder;
