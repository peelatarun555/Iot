"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const datapoint_schema_1 = require("@schemas/datapoint.schema");
const device_schema_1 = __importDefault(require("@schemas/device.schema"));
const place_schema_1 = __importDefault(require("@schemas/place.schema"));
const datapoint_service_1 = require("@services/datapoint.service");
const device_service_1 = require("@services/device.service");
const timescaledb_service_1 = __importDefault(require("@services/timescaledb.service"));
require("dotenv/config");
const mariadb_1 = __importDefault(require("mariadb"));
const module_alias_1 = __importDefault(require("module-alias"));
const path_1 = __importDefault(require("path"));
require("reflect-metadata");
const logger_1 = __importDefault(require("@tightec/logger"));
const enums_1 = require("@utils/enums");
const typeorm_1 = require("typeorm");
const fromimportDate = undefined;
module_alias_1.default.addAliases({
    "@resolvers": path_1.default.join(__dirname, "../", "resolvers"),
    "@validations": path_1.default.join(__dirname, "../", "validations"),
    "@db": path_1.default.join(__dirname, "../", "db"),
    "@utils": path_1.default.join(__dirname, "../", "utils"),
    "@middlewares": path_1.default.join(__dirname, "..", "middlewares"),
    "@services": path_1.default.join(__dirname, "..", "services"),
    "@schemas": path_1.default.join(__dirname, "..", "schemas"),
    "@controller": __dirname + "/controller",
});
async function migrateToNewDatabase() {
    logger_1.default.configure({ logLevel: "debug" });
    const connection = await mariadb_1.default.createConnection({
        host: "localhost",
        user: "root",
        password: "password",
        database: "eotlab",
        port: 3306,
    });
    await timescaledb_service_1.default.initConnection();
    const devices = (await connection.query("SELECT * FROM device;"));
    logger_1.default.info("Found " + devices.length + " devices");
    for (const device of devices) {
        if (device.name.length < 4) {
            device.name = "unikoblenz-pynode-" + device.name;
        }
    }
    const measurementsLength = Number((await connection.query("SELECT COUNT(time) as count FROM measurement"))[0]
        .count);
    const dbDevices = [];
    for (let k = 0; k < devices.length; k++) {
        const device = devices[k];
        if (device.name.length == 2) {
            device.name = "unikoblenz-pynode-" + device.name;
        }
        const location = device.location;
        const builing = device.building;
        let buildingPlace = null;
        if (builing != null && builing != "") {
            buildingPlace = await place_schema_1.default.findOneBy({ name: builing.toUpperCase() });
            if (!buildingPlace) {
                buildingPlace = new place_schema_1.default();
                buildingPlace.name = builing.toUpperCase();
                logger_1.default.info("Create place (building) - " + buildingPlace.name);
                await buildingPlace.save();
            }
        }
        let locationPlace = await place_schema_1.default.findOneBy({ name: location });
        if (!locationPlace) {
            locationPlace = new place_schema_1.default();
            locationPlace.name = location;
            if (buildingPlace)
                locationPlace.parent = buildingPlace;
            logger_1.default.info("Create place - " + location);
            await locationPlace.save();
        }
        let deviceDevice = await device_schema_1.default.findOne({
            where: { name: device.name, deletedAt: (0, typeorm_1.IsNull)() },
            relations: { sensors: true },
        });
        const sensors = await connection.query("SELECT id_sensor, description FROM sensor WHERE device_id = " +
            device.id_device +
            ";");
        if (!deviceDevice) {
            deviceDevice = await device_service_1.DeviceService.createDevice(device.name, "00000000000000" +
                device.name.substring(device.name.length - 2, device.name.length), "pynode", enums_1.DeviceStatus.production, locationPlace.id, {
                sensors: sensors.map((s) => {
                    return { name: s.description, sensorType: s.description };
                }),
            });
            logger_1.default.info("Create device - " + device.name);
        }
        dbDevices.push({ device: deviceDevice, oldDevice: device });
    }
    for (let k = 0; k < dbDevices.length; k++) {
        const device = dbDevices[k].oldDevice;
        const deviceDevice = dbDevices[k].device;
        await Promise.all(deviceDevice.sensors.map(async (sensor) => {
            const measurements = await connection.query(fromimportDate != null
                ? `SELECT sensor_id, device_id, time, value, description
    FROM measurement
    INNER JOIN sensor
    ON measurement.sensor_id = sensor.id_sensor WHERE device_id = ${device.id_device} AND description = "${sensor.name}" AND time > '${fromimportDate
                    .toISOString()
                    .substring(0, 10)}'
    ORDER BY time;`
                : `SELECT sensor_id, device_id, time, value, description
        FROM measurement
        INNER JOIN sensor
        ON measurement.sensor_id = sensor.id_sensor WHERE device_id = ${device.id_device} AND description = "${sensor.name}"
        ORDER BY time;`);
            if (measurements.length == 0) {
                logger_1.default.info("No measurements from sensor " +
                    sensor.name +
                    " - device " +
                    deviceDevice.name +
                    (fromimportDate != null
                        ? " after " + fromimportDate.toISOString().substring(0, 10)
                        : ""));
                return;
            }
            logger_1.default.info("Got measurements from device: " +
                device.name +
                " - sensor: " +
                sensor.name);
            await datapoint_service_1.DatapointService.createDatapoints(deviceDevice.devEui, measurements.map((m) => {
                return {
                    timestamp: new Date(m.time.getTime() + 1000 * 3600 * 2),
                    value: m.value,
                    sensorId: sensor.id,
                };
            }), true);
            const measurementsCount = Number(await datapoint_schema_1.Datapoint.count());
            logger_1.default.info("Insert measurements " +
                device.name +
                " - m: " +
                measurements.length +
                " - d: " +
                (k + 1) +
                " / " +
                devices.length +
                " - p: " +
                Math.round((measurementsCount * 10000) / measurementsLength) / 100 +
                "%");
        }));
    }
    logger_1.default.info("Migration finished");
    process.exit();
}
migrateToNewDatabase();
