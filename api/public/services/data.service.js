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
exports.DataService = void 0;
const sensor_schema_1 = __importStar(require("@schemas/sensor.schema"));
const logger_1 = __importDefault(require("@tightec/logger"));
const enums_1 = require("@utils/enums");
class DataService {
    static async handleRssiData(device, rssi) {
        let sensor = device.sensors.find((s) => s.name === "rssi");
        if (sensor == null) {
            logger_1.default.info("Device " +
                device.devEui +
                " has no sensor with name rssi, creating a new one");
            let sensorType = await sensor_schema_1.SensorType.findOne({
                where: { name: "rssi", type: enums_1.SensorDataType.number },
            });
            if (!sensorType) {
                sensorType = await sensor_schema_1.SensorType.create({
                    name: "rssi",
                    type: enums_1.SensorDataType.number,
                }).save();
            }
            sensor = await sensor_schema_1.default.create({
                name: "rssi",
                sensorType: sensorType,
                device: device,
            }).save();
        }
        return {
            timestamp: new Date(),
            value: rssi,
            sensorId: sensor.id,
        };
    }
}
exports.DataService = DataService;
