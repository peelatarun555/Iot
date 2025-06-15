"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_middleware_1 = require("@middlewares/auth.middleware");
const error_middleware_1 = require("@middlewares/error.middleware");
const validation_middleware_1 = __importDefault(require("@middlewares/validation.middleware"));
const device_schema_1 = __importDefault(require("@schemas/device.schema"));
const data_service_1 = require("@services/data.service");
const datapoint_service_1 = require("@services/datapoint.service");
const library_service_1 = __importDefault(require("@services/library.service"));
const logger_1 = __importDefault(require("@tightec/logger"));
const enums_1 = require("@utils/enums");
const env_1 = require("@utils/env");
const data_validation_1 = __importDefault(require("@validations/data.validation"));
const express_1 = require("express");
const joi_1 = __importDefault(require("joi"));
const typeorm_1 = require("typeorm");
class DataController {
    path = "/data";
    router = (0, express_1.Router)();
    lastTTNPingTimestamp = 0;
    lastChirpstackPingTimestamp = 0;
    constructor() {
        this.insertChirpData = this.insertChirpData.bind(this);
        this.insertTTNData = this.insertTTNData.bind(this);
        this.router.post(this.path + "/chirp", (0, auth_middleware_1.authenticateApiToken)(), this.chirpstackEventTypeChecker, (0, validation_middleware_1.default)(data_validation_1.default.Body.insertDataChirp), (0, error_middleware_1.errorHandleAsyncMiddleware)(this.insertChirpData));
        this.router.post(this.path + "/ttn", (0, auth_middleware_1.authenticateApiToken)(), (0, validation_middleware_1.default)(data_validation_1.default.Body.insertDataTTN), (0, error_middleware_1.errorHandleAsyncMiddleware)(this.insertTTNData));
    }
    chirpstackEventTypeChecker(req, res, next) {
        if (req.query["event"] === "up") {
            return next();
        }
        res.status(200).send({
            message: "Event type not supported",
        });
    }
    async sendStatusPing(baseUrl, isTTN = true) {
        if (baseUrl === "") {
            return;
        }
        const now = Date.now();
        const THIRTY_SECONDS = 30000;
        if (isTTN) {
            if (this.lastTTNPingTimestamp != 0 &&
                now - this.lastTTNPingTimestamp < THIRTY_SECONDS) {
                logger_1.default.debug("Ping skipped: last ping was sent less than 30 seconds ago.");
                return;
            }
            this.lastTTNPingTimestamp = now;
        }
        else {
            if (this.lastChirpstackPingTimestamp != 0 &&
                now - this.lastChirpstackPingTimestamp < THIRTY_SECONDS) {
                logger_1.default.debug("Ping skipped: last ping was sent less than 30 seconds ago.");
                return;
            }
        }
        const status = "up";
        const msg = "OK";
        const pingValue = new Date().toISOString();
        const pingUrl = `${baseUrl}?status=${encodeURIComponent(status)}&msg=${encodeURIComponent(msg)}&ping=${encodeURIComponent(pingValue)}`;
        try {
            const response = await fetch(pingUrl, {
                method: "GET",
            });
            if (!response.ok) {
                throw new Error(`Ping failed with status: ${response.status} - ${response.statusText}`);
            }
            logger_1.default.verbose(`Ping sent successfully: ${pingUrl}`);
        }
        catch (error) {
            logger_1.default.error(`Error sending ping: ${error}`);
        }
    }
    async insertChirpData(req, res) {
        const { time, deviceInfo, object, rxInfo } = req.body;
        logger_1.default.info("Message received from chirpstack: " +
            deviceInfo.deviceName +
            " devEui: " +
            deviceInfo.devEui.toUpperCase());
        const device = await device_schema_1.default.findOne({
            where: { devEui: deviceInfo.devEui.toUpperCase(), deletedAt: (0, typeorm_1.IsNull)() },
            select: { id: true, devEui: true, sensors: { id: true, name: true } },
            relations: { sensors: { sensorType: true } },
        });
        if (!device) {
            return res
                .status(400)
                .send({ message: "Device is not registered in db" });
        }
        const datapoints = [];
        for (const sensor of device.sensors) {
            const value = object[sensor.name];
            if (value == null) {
                continue;
            }
            try {
                const datapoint = this._createDatapoint(sensor, time, value);
                datapoints.push(datapoint);
            }
            catch (err) {
                return res.status(400).send({
                    message: "Sensor " + sensor.name + " has validation errors: " + err.details,
                });
            }
        }
        if (rxInfo && rxInfo.length > 0) {
            const rssi = rxInfo.map((rx) => rx.rssi).reduce((a, b) => (a + b) / 2);
            datapoints.push(await data_service_1.DataService.handleRssiData(device, rssi));
        }
        try {
            await datapoint_service_1.DatapointService.createDatapoints(device.devEui, datapoints, false);
        }
        catch (err) {
            if (err.code == "23505") {
                return res.status(400).send({
                    message: "Data already exists",
                });
            }
            logger_1.default.error("Error while creating datapoints: " + err);
            return res.status(500).send({
                message: err,
            });
        }
        this.sendStatusPing(env_1.env.CHIRPSTACK_PING_STATUS_URL, false);
        res.status(200).send({
            message: "Successfull created datapoints",
        });
    }
    async insertTTNData(req, res) {
        const { end_device_ids, uplink_message } = req.body;
        logger_1.default.info("Message received from ttn: " +
            end_device_ids.device_id +
            " devEui: " +
            end_device_ids.dev_eui);
        const device = await device_schema_1.default.findOne({
            where: {
                devEui: end_device_ids.dev_eui.toUpperCase(),
                deletedAt: (0, typeorm_1.IsNull)(),
            },
            select: {
                id: true,
                devEui: true,
                sensors: { id: true, name: true, sensorType: true },
            },
            relations: { sensors: { sensorType: true } },
        });
        if (!device) {
            return res
                .status(400)
                .send({ message: "Device is not registered in db" });
        }
        const datapoints = [];
        for (const sensor of device.sensors) {
            const value = uplink_message.decoded_payload[sensor.name];
            if (value == null) {
                continue;
            }
            try {
                const datapoint = this._createDatapoint(sensor, uplink_message.settings.time, value);
                datapoints.push(datapoint);
                if (datapoint?.value != null)
                    await library_service_1.default.onDatapointChange(sensor.id, datapoint);
            }
            catch (err) {
                return res.status(400).send({
                    message: "Sensor " + sensor.name + " has validation errors: " + err.details,
                });
            }
        }
        if (uplink_message.rx_metadata && uplink_message.rx_metadata.length > 0) {
            const rssi = uplink_message.rx_metadata
                .map((rx) => rx.rssi)
                .filter((rssi) => rssi != null)
                .reduce((a, b) => (a + b) / 2);
            datapoints.push(await data_service_1.DataService.handleRssiData(device, rssi));
        }
        try {
            await datapoint_service_1.DatapointService.createDatapoints(device.devEui, datapoints, false);
        }
        catch (err) {
            if (err.code == "23505") {
                return res.status(400).send({
                    message: "Data already exists",
                });
            }
            logger_1.default.error("Error while creating datapoints: " + err);
            return res.status(500).send({
                message: err,
            });
        }
        this.sendStatusPing(env_1.env.TTN_PING_STATUS_URL, true);
        res.status(200).send({
            message: "Successfull created datapoints",
        });
    }
    _createDatapoint(sensor, timestamp, value) {
        const datapoint = {
            sensorId: sensor.id,
            timestamp,
        };
        if (sensor.sensorType.type === enums_1.SensorDataType.number) {
            joi_1.default.number().validate(value);
            datapoint.value = Number(value);
        }
        else if (sensor.sensorType.type === enums_1.SensorDataType.string) {
            joi_1.default.string().validate(value);
            datapoint.valueString = value.toString();
            datapoint.value = Number.isFinite(Number(value))
                ? Number(value)
                : undefined;
        }
        return datapoint;
    }
}
exports.default = DataController;
