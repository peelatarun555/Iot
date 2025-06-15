"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sensor_schema_1 = __importDefault(require("@schemas/sensor.schema"));
const datapoint_service_1 = require("@services/datapoint.service");
const logger_1 = __importDefault(require("@tightec/logger"));
const enums_1 = require("@utils/enums");
const typeorm_1 = require("typeorm");
const models_1 = require("../models");
const socket_io_server_1 = __importDefault(require("../socket.io/socket-io.server"));
class LibraryService {
    static async getInitialStates() {
        const sensors = await sensor_schema_1.default.find({
            where: { libraryId: (0, typeorm_1.Not)((0, typeorm_1.IsNull)()) },
            select: { id: true, libraryId: true },
            relations: { device: true },
        });
        const payload = [];
        for (const sensor of sensors) {
            const datapoints = await datapoint_service_1.DatapointService.getLastDatapoints(sensor.id, 6);
            payload.push({
                libraryId: sensor.libraryId,
                seatState: this.getSeatState(datapoints),
                devEui: sensor.device.devEui,
            });
        }
        return payload;
    }
    static async onDatapointChange(sensorId, newDatapoint = null) {
        try {
            const sensor = await sensor_schema_1.default.findOne({
                where: { id: sensorId },
                select: { id: true, libraryId: true },
                relations: { device: true },
            });
            if (!sensor?.libraryId)
                return;
            const datapoints = await datapoint_service_1.DatapointService.getDatapoints({
                sensorId: sensorId,
                options: {
                    timeGroupSettings: enums_1.TimeGroupSettings.minute,
                    binSize: 1,
                    from: new Date(Date.now() - 10 * 60 * 1000),
                },
            });
            if (newDatapoint)
                datapoints.push(newDatapoint);
            const payload = {
                libraryId: sensor.libraryId,
                seatState: this.getSeatState(datapoints),
                devEui: sensor.device.devEui,
            };
            this.notifyClient(payload);
            logger_1.default.debug("WebSocket: Client notified of seat change.");
        }
        catch (err) {
            logger_1.default.error("WebSocket: Failed to notify client - " + err);
        }
    }
    static notifyClient(payload) {
        socket_io_server_1.default.instance.notifyDataChanges("library seat changed", payload);
    }
    static getSeatState(datapoints) {
        if (datapoints.length === 0)
            return models_1.SeatState.UNKNOWN;
        if (datapoints.length <= 3)
            return models_1.SeatState.IN_BETWEEN;
        const avg = datapoints.reduce((acc, curr) => {
            if (curr.value == null)
                return acc;
            return acc + curr.value / datapoints.length;
        }, 0);
        return avg < 30 ? models_1.SeatState.FREE : models_1.SeatState.OCCUPIED;
    }
}
exports.default = LibraryService;
